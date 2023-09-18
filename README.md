# Validate.js - Validação de formulário em JavaScript

O pacote **Validate.js** fornece uma validação simples e personalizada para formulários HTML em JavaScript puro.

## Baixando

### NPM

Utilize o comando `npm i validate-jjrdev` para instalar o pacote **Validate.js**.

### GitHub

Baixe o arquivo diretamente do repositório **GitHub** clicando [aqui](https://github.com/jjr-dev/validate.js/blob/main/validate.js).

## Instalando

O pacote **Validate.js** possui suporte para uso **Asynchronous Module Definition** padrão do **JavaScript** para uso na tag `<script>`:

### Arquivo local

```html
<script src="./validate.js"></script>
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/validate-jjrdev@latest/validate.js"></script>
```

> Defina a versão manualmente alterando `latest` para a versão desejada.

## Usando

A validação do formulário deve ser realizada da seguinte forma:

```js
const validate = new Validate();

validate.form("form#validate", {
    rules: {
        // Regras de validação
    },
    messages: {
        // Mensagens de validação
    },
    submitHandler: (data, form) => {
        // Callback de sucesso
    },
});
```

### Regras

As regras de cada campo do formulário deve ser definida na propriedade `rules` do objeto, como por exemplo:

```js
rules: {
    "name": {
        required: true,
        name: true
    },
    "phone": {
        required: true,
        minlength: 14,
        maxlength: 15
    }
}
```

| Opção     | Tipo           | Padrão  | Exemplo                 | Descrição                                                   |
| --------- | -------------- | ------- | ----------------------- | ----------------------------------------------------------- |
| required  | Boleano        | `false` | `true`                  | Campo obrigatório                                           |
| email     | Boleano        | `false` | `true`                  | Campo de email                                              |
| minlength | Inteiro        | `null`  | `8`                     | Quantidade mínima de caracteres no campo                    |
| maxlength | Inteiro        | `null`  | `15`                    | Quantidade máxima de caracteres no campo                    |
| length    | Inteiro        | `null`  | `12`                    | Quantidade exata de caracteres no campo                     |
| equalTo   | String         | `null`  | `form#password-confirm` | Campo deve ser igual a outro campo                          |
| name      | Boleano        | `false` | `true`                  | Campo deve ser um texto sem caracteres especiais ou números |
| pattern   | String (regex) | `null`  | `[1-9]`                 | Campo deve corresponder um regex                            |

É possível definir as regras `required`, `minlength`, e `maxlength` diretamente na tag HTML, por exemplo:

```html
<input required /> <input minlength="10" maxlength="15" />
```

### Mensagens

As mensagens de cada campo do formulário deve ser definida na propriedade `messages` do objeto, como por exemplo:

```js
messages: {
    "name": {
        required: "Informe um nome",
        name: "Informe um nome válido"
    },
    "phone": {
        required: "Informe um telefone",
        minlength: "Informe um telefone maior",
        maxlength: "Informe um telefone menor"
    }
}
```

> Mensagens não definidas retornará um aviso vazio ("").

### Parentes

As mensagens de erro são automaticamente adicionadas no mesmo elemento pai onde o campo está localizado, contudo, certos momentos pode ser necessário adicionar a mensagem em algum elemento mais acima, isso pode ser definido na propriedade `parents` do objeto, como por exemplo:

```js
parents: {
    "name": 1
}
```

### Callback de sucesso

A fução definida na propriedade `submitHandler` é executada quando todas as regras são validadas e aprovadas, retornando sempre as variáveis `data` com campos e valores e `form` com o elemento do formulário (útil para executar ações no formulário), como por exemplo:

```js
submitHandler: (data, form) => {
    console.log(data);
};
```
