class Validate {
    form(form, options = {}) {
        form = document.querySelector(form);

        if (form) {
            form.setAttribute("novalidate", true);

            form.addEventListener("submit", (e) => {
                e.preventDefault();

                this.validateForm(form, options);

                if ("rules" in options) {
                    for (const name in options.rules) {
                        const itemsElement = form.querySelectorAll(
                            `[name="${name}"]`
                        );
                        if (!itemsElement) continue;

                        for (const itemElement of itemsElement) {
                            ["change", "input"].forEach((event) => {
                                itemElement.addEventListener(event, () => {
                                    this.validateForm(form, options, true);
                                });
                            });
                        }
                    }
                }
            });

            form.addEventListener("reset", (e) => {
                // TODO: Remover avisos ao resetar
            });
        }
    }

    getFormData(form) {
        const data = Object.fromEntries(new FormData(form).entries());

        for (const item in data) {
            const el = form.querySelector(`[name="${item}"]`);

            if (el.type == "radio") {
                const checked = form.querySelector(`[name="${item}"]:checked`);
                data[item] =
                    checked.getAttribute("value") ?? checked.getAttribute("id");
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

                let parent = itemElement;

                for (let i = 0; i < itemParents; i++) {
                    parent = parent.parentNode;
                }

                const oldMessage = parent.parentNode.querySelector(
                    "label.form-error-msg"
                );
                if (oldMessage) oldMessage.remove();

                itemElement.removeAttribute("invalid");
                parent.classList.remove("validate-error");

                if (messages.length === 0) continue;

                itemElement.setAttribute("invalid", "");

                const message = messages[0];

                if (message === "") continue;

                parent.insertAdjacentHTML(
                    "afterend",
                    `<label for='${name}' class='form-error-msg'>${message}</label>`
                );

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
        const getErrorMessage = (rule, name, value = false) => {
            if (!messages[name] || !messages[name][rule]) return "";

            let message = messages[name][rule];

            if (value) message = message.replace("?", value);

            return message;
        };

        const addError = (name, rule, value = false) => {
            errors[name].push(getErrorMessage(rule, name, value));
        };

        const ruleValidate = (rules, rule, name) => {
            const ruleValue = rules[rule];
            const itemValue = data[name] ?? "";

            switch (rule) {
                case "required":
                    if (this.ruleRequired(ruleValue, itemValue))
                        addError(name, rule);
                    break;
                case "email":
                    if (this.ruleEmail(ruleValue, itemValue))
                        addError(name, rule);
                    break;
                case "minlength":
                    if (this.ruleMinLength(ruleValue, itemValue))
                        addError(name, rule, ruleValue);
                    break;
                case "maxlength":
                    if (this.ruleMaxLength(ruleValue, itemValue))
                        addError(name, rule, ruleValue);
                    break;
                case "length":
                    if (!this.ruleLength(ruleValue, itemValue))
                        addError(name, rule);
                    break;
                case "equalTo":
                    if (!this.ruleEqualTo(ruleValue, itemValue, form))
                        addError(name, rule);
                    break;
                case "name":
                    if (!this.ruleName(ruleValue, itemValue))
                        addError(name, rule);
                    break;
                case "pattern":
                    if (!this.rulePattern(ruleValue, itemValue))
                        addError(name, rule);
                    break;
            }
        };

        const data = this.getFormData(form);

        const errors = {};
        const { messages, parents } = options;

        if ("rules" in options) {
            for (const name in options.rules) {
                const rules = options.rules[name];

                if (!errors[name]) errors[name] = [];

                for (const rule in rules) {
                    ruleValidate(rules, rule, name);
                }
            }
        }

        if (
            !this.showFormErrors(form, errors, parents, reValidate) &&
            !reValidate &&
            options.submitHandler
        )
            options.submitHandler(data, form);
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

    ruleName(rule, value) {
        return rule && this.isAlpha(value, true);
    }

    ruleRequired(rule, value) {
        return rule && this.isEmpty(value);
    }

    ruleEmail(rule, value) {
        return rule && !this.isEmail(value);
    }

    ruleMinLength(rule, value) {
        return value.length > 0 && value.length < parseInt(rule);
    }

    ruleMaxLength(rule, value) {
        return value.length > 0 && value.length > parseInt(rule);
    }

    ruleLength(rule, value) {
        return value.length == parseInt(rule);
    }

    ruleEqualTo(rule, value, form) {
        const equal = form.querySelector(`[name="${rule}"]`);

        if (!equal) return false;
        return value == equal.value;
    }

    rulePattern(rule, value) {
        const regex = new RegExp(rule);
        return regex.test(value);
    }
}
