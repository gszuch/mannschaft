// Provides an equals comparison in the handlebars template
var register = function(Handlebars) {
    var helpers = {
        equals: function(val1,val2,options) {
            if (val1 == val2) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
            return null;
        }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var help in helpers) {
            Handlebars.registerHelper(help, helpers[help]);
        }
    }
    else {
        return helpers;
    }
}

module.exports.register = register;
module.exports.helpers = register(null);