/**
 * Cách dùng thư viện Validator
 * Validator({
 * form: (chuyền id hoặc class vào),
 * formGroupSelector: (chuyền id hoặc class vào),
 * errorMessage: (chuyền id hoặc class vào),
 * rule:[
 * Validator.isRequired(chuyền id hoặc class vào),
 * Validator.minLength(chuyền id hoặc class vào),
 * Validator.isConfirmed(chuyền id hoặc class vào),
 * Validator.isEmail(chuyền id hoặc class vào),
 * ]
 * onSubmit: function(data) {
           console.log(data)
        },
 * })
 * 
 */
// Đối tượng Validator
function Validator(options){

    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formElement = document.querySelector(options.form);
    var selectorRules = {};
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var getParents = getParent(inputElement, options.formGroupSelector);
        var errorElement = getParents.querySelector(options.errorMessage);
        var errorMess;

        // Lấy ra các rule của selector 
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rules và kiểm tra 
        // Nếu có lỗi thì dừng việc kiểm tra 
        for( var i = 0; i < rules.length; ++i){

            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMess = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMess = rules[i](inputElement.value)

            }
            if(errorMess) break;
        }

        if(errorMess){
            errorElement.innerText = errorMess;
            getParents.querySelector('.form-input').classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParents.querySelector('.form-input').classList.remove('invalid');
        }

        return !errorMess;
    }
// Lấy element của form cần validate
    if(formElement){
        // Khi submid form
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            // thực hiện lặp qua từng rule và validate hết luôn
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid =  validate(inputElement, rule);

                if(!isValid){
                    isFormValid = false;
                }
            })
            

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        
                        switch(input.type){
                            case 'checkbox':
                                values[input.name] = formElement.querySelectorAll('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'radio':
                                if(input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;

                        }

                        return values;
                        },{})

                    options.onSubmit(formValues)
                }
            }

        };

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input ...)
        options.rules.forEach(function(rule){

            // Lưu lại rules trong ô input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement){
                 // Xử lý khi blur khỏi input 
        
                 inputElement.onblur = function(){
                    validate(inputElement, rule);
                 }   
             
             // Xử lý khi nhập input
                 var getParents = getParent(inputElement, options.formGroupSelector);
                 inputElement.oninput = function() {
                     var errorElement = getParents.querySelector(options.errorMessage);
                     errorElement.innerText = '';
                     getParents.querySelector('.form-input').classList.remove('invalid');
                 }

            })
           


        });
    };
}

// Định nghĩa rules
// Nguyên tắc của các rules
// 1. Khi có lỗi => trả ra mesage lỗi 
// 2. Khi không có lỗi => không trả ra cái gì cả
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return  value.trim() ? undefined : message || "Vui lòng nhập trường này!";
        },
    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            
            return regex.test(value) ? undefined : message || "Trường này là email !"; 
        },
    };
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tổi thiểu ${min} kí tự!`; 
        },
    };
}

Validator.isConfỉrmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        },
    };
}
