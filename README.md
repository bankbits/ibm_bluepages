# Nodejs Customize Module ‘ibm_bluepages’.

The Module help developer working on an internal application based on Nodejs runtime we were looking for IBM authentication.

## Table of Contents
  * [Installation](#installation)
    * [NPM](#npm)
  * [Usage](#usage)
  * [Questions](#questions)

## Installation

##### NPM

```npm
npm install ibm_bluepages
```

## Usage

```nodejs
var bluepage = require("ibm_bluepages");

bluepage.authenticate("your id","your password", function(value) {

		if (value == false) {
			console.log("your id or password not correct!");
		}

		if (value == true) {
			console.log("you have login");
		}
});
```

## Questions

If you are having difficulties using the Module or you have a question about the IBM
Watson Services, please ask a question by mail, very happy you used the module.

## License

This library is licensed under IBM Public License v1.0. Full license text is
available in [LICENSE](https://spdx.org/licenses/IPL-1.0.html).