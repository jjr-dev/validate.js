class Validate {
    constructor(form = false, options = {}) {
        this.rules = {
            name: (rule, value) => {
                return !rule || this.isAlpha(value, true);
            },
            required: (rule, value) => {
                return !rule || !this.isEmpty(value);
            },
            email: (rule, value) => {
                return !rule || this.isEmail(value);
            },
            minlength: (rule, value) => {
                return value.length >= parseInt(rule);
            },
            maxlength: (rule, value) => {
                return value.length <= parseInt(rule);
            },
            length: (rule, value) => {
                return value.length == parseInt(rule);
            },
            equalTo: (rule, value, form) => {
                const equal = form.querySelector(`[name="${rule}"]`);

                if (!equal) return false;
                return value == equal.value;
            },
            pattern: (rule, value) => {
                const regex = new RegExp(rule);
                return regex.test(value);
            },
        };

        this.messages = {
            name: "Nome inválido",
            required: "Campo obrigatório",
            email: "Email inválido",
            minlength: "Campo deve ser menor que ? caracteres",
            maxlength: "Campo deve ser maior que ? caracteres",
            length: "Campo deve conter ? caracteres",
            equalTo: "Valor não corresponde",
            pattern: "Formato inválido",
        };

        if (form) this.form(form, options);
    }

    form(form, options = {}) {
        form = typeof form == "string" ? document.querySelector(form) : form;
        if (!form) return;

        if (!("rules" in options)) options.rules = {};
        if (!("messages" in options)) options.messages = {};

        const controls = form.querySelectorAll("input, textarea, select");
        for (const control of controls) {
            const name = control.getAttribute("name");
            if (!name) continue;

            if (!(name in options.rules)) options.rules[name] = {};

            ["required", "minlength", "minlength"].forEach((rule) => {
                if (!(rule in options.rules[name])) {
                    let value = control.getAttribute(rule);
                    if (value || value === "") {
                        value = value.toLowerCase();
                        options.rules[name][rule] = value === "true" || value === name || value === "" ? true : value === "false" ? false : value;
                    }
                }
            });

            if (control.getAttribute("type") === "email" && !("email" in options.rules[name])) options.rules[name]["email"] = true;

            if (!control.validate) {
                control.validate = {};

                control.validate.addRule = (rule, value = true, message = false) => {
                    if (!(name in options.rules)) options.rules[name] = {};
                    options.rules[name][rule] = value;

                    if (message) {
                        if (!(name in options.messages)) options.messages[name] = {};
                        options.messages[name][rule] = message;
                    }

                    this.form(form, options);
                };

                control.validate.addRules = (rules) => {
                    for (const rule in rules) {
                        const item = rules[rule];
                        control.validate.addRule(rule, item.value, item.message);
                    }
                };

                control.validate.removeRule = (rule) => {
                    if (!(name in options.rules) || !(rule in options.rules[name])) return;
                    delete options.rules[name][rule];

                    this.form(form, options);
                };

                control.validate.removeRules = (rules) => {
                    rules.forEach((rule) => control.validate.removeRule(rule));
                };

                control.validate.showErrorMessage = (message) => {
                    this.showFormErrors(
                        form,
                        {
                            [name]: [message],
                        },
                        options.parents
                    );
                };
            }
        }

        const { rules } = options;

        if (rules) {
            for (const name in rules) {
                if (Object.keys(rules[name]).length === 0) delete rules[name];
            }
        }

        form.setAttribute("novalidate", true);

        form.onsubmit = (e) => {
            e.preventDefault();

            this.validateForm(form, options);

            if (rules) {
                for (const name in rules) {
                    form.querySelectorAll(`[name="${name}"]`).forEach((itemElement) => {
                        ["change", "input"].forEach((event) => {
                            itemElement.addEventListener(event, () => {
                                this.validateForm(form, options, true);
                            });
                        });
                    });
                }
            }
        };

        form.addEventListener("reset", () => {
            if (rules) {
                for (const name in options.rules) {
                    const itemElement = form.querySelector(`[name="${name}"]`);
                    if (!itemElement) continue;

                    itemElement.classList.remove("validate-error");
                    itemElement.removeAttribute("invalid");

                    const msg = form.querySelector(`label.form-error-msg[for="${name}"]`);
                    if (msg) msg.remove();
                }
            }
        });
    }

    getFormData(form) {
        const data = Object.fromEntries(new FormData(form).entries());

        for (const item in data) {
            const el = form.querySelector(`[name="${item}"]`);

            if (el.type == "radio") {
                const checked = form.querySelector(`[name="${item}"]:checked`);
                data[item] = checked.getAttribute("value") ?? checked.getAttribute("id");
            }
        }

        return data;
    }

    showFormErrors(form, errors = {}, parents = {}, reValidate = false) {
        let focused = false;
        let hasError = false;

        for (const name in errors) {
            const messages = errors[name];

            const itemsElement = form.querySelectorAll(`[name="${name}"]`);
            if (!itemsElement) continue;

            for (const itemElement of itemsElement) {
                const defaultParents = parents["default"] ?? 0;
                const itemParents = parseInt(parents[name] ?? defaultParents);

                if (!this.isVisibleElement(itemElement) && itemParents == 0) continue;

                let parent = itemElement;

                for (let i = 0; i < itemParents; i++) {
                    parent = parent.parentNode;
                }

                if (!this.isVisibleElement(parent)) continue;

                const oldMessage = parent.parentNode.querySelector("label.form-error-msg");
                if (oldMessage) oldMessage.remove();

                itemElement.removeAttribute("invalid");
                parent.classList.remove("validate-error");

                if (messages.length === 0) continue;

                itemElement.setAttribute("invalid", "");

                const message = messages[0];

                if (message === "") continue;

                parent.insertAdjacentHTML("afterend", `<label for='${name}' class='form-error-msg'>${message}</label>`);

                parent.classList.add("validate-error");

                if (!reValidate && !focused) {
                    itemElement.focus();
                    focused = true;
                }

                if (!hasError) hasError = true;
            }
        }

        return hasError;
    }

    validateForm(form, options, reValidate = false) {
        const { messages, parents, rules } = options;

        const getErrorMessage = (rule, name, value) => {
            let message = messages[name] && messages[name][rule] ? messages[name][rule] : this.messages[rule] ?? "";
            return message.replace("?", value);
        };

        const addError = (name, rule, value = false) => {
            errors[name].push(getErrorMessage(rule, name, value));
        };

        const ruleValidate = (rules, rule, name) => {
            const ruleValue = rules[rule];
            const itemValue = data[name] ?? "";

            if (rule in this.rules && !this.rules[rule](ruleValue, itemValue, form)) addError(name, rule, ruleValue);
        };

        const data = this.getFormData(form);

        const errors = {};

        if (rules) {
            for (const name in options.rules) {
                const rules = options.rules[name];

                if (!errors[name]) errors[name] = [];

                for (const rule in rules) {
                    ruleValidate(rules, rule, name);
                }
            }
        }

        const hasError = this.showFormErrors(form, errors, parents, reValidate);

        if (!reValidate) {
            if (!hasError && options.submitHandler) options.submitHandler(data, form);
            else if (hasError && options.invalidHandler) options.invalidHandler(errors, data, form);
        }
    }

    isEmpty(str) {
        return str.trim().length === 0;
    }

    isAlpha(str, ignoreSpace = false) {
        if (ignoreSpace) str = str.replace(/\s/g, "");
        else if (str.includes(" ")) return false;

        str = str.toUpperCase();

        const regex = /^[A-ZÀ-ÖØ-Ý]+$/;
        return regex.test(str);
    }

    isEmail(str) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(str);
    }

    addCustomRule(name, callback, message = false) {
        this.rules[name] = callback;
        if (message) this.addDefaultMessage(name, message);
    }

    addDefaultMessage(name, message) {
        this.messages[name] = message;
    }

    isVisibleElement(element) {
        if (!element) return false;

        let parent = element.parentElement;
        while (parent) {
            const style = getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden") return false;

            parent = parent.parentElement;
        }

        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
    }
}
