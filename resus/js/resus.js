var app = angular.module("app", []);

function formatNumberValue(value) {
    // If the value is null or undefined, return an empty string
    if (value == null) {
        return "";
    }

    // If the value is a string, return it as is
    if (typeof value === "string") {
        return value;
    }

    // If the value is a number
    if (typeof value === "number") {
        // Check if the number has a decimal point
        if (value % 1 !== 0) {
            // Convert to string with one digit after the decimal point
            return value.toFixed(2);
        } else {
            // Convert to string without decimal point
            return value.toString();
        }
    }

    // For other types, return an empty string
    return "";
}
  
app.controller("ResusController", ['$scope', '$rootScope', '$timeout', '$http', function($scope, $rootScope, $timeout, $http) {
    const ctrl = this;
    window.ctrl = this;
    ctrl.dataShown = 'CALCULATOR'; // possible values: CALCULATOR, WEIGHTS, LMA
    ctrl.weight;
    ctrl.age;
    ctrl.ageScale = 'YEARS';
    ctrl.sex; // possible values: MALE, FEMALE
    ctrl.drugsData = {};
    ctrl.airwaysData = {};
    ctrl.airwaysForAge = {};

    function init() {
        $http.get('/resus/data/resus-drugs.json').then(function(response) {
            ctrl.drugsData = response.data;
        });
        $http.get('/resus/data/airways.json').then(function(response) {
            ctrl.airwaysData = response.data;
        });
    };

    ctrl.getDefi = function(multiplier) {      
        return Math.min(multiplier*ctrl.weight,200);
    };

    ctrl.ageAsInTable = function() {
        if (ctrl.age == 1 && ctrl.ageScale == 'YEARS') {
            return "12 month";
        }
        if (ctrl.age == 2 && ctrl.ageScale == 'YEARS') {
            return "24 month";
        }
        return ctrl.age + (ctrl.ageScale == 'YEARS' ? " year" : " month");
    }
    
    ctrl.changedValue = function() {   
        if (!ctrl.age) {
            return;            
        }
        var ageAsString = ctrl.ageAsInTable();
        for (var i = 0; i < ctrl.airwaysData.dataByAge.length; ++i) {
            const currData = ctrl.airwaysData.dataByAge[i];
            if (ageAsString == currData.age) {
                ctrl.airwaysForAge = currData;
                return;
            }
        }
    };

    ctrl.evalDose2 = function(drug) {
        if (!drug.dose_2) {
            return "";
        }
        var body = "return " + drug.dose_2 + ";";
        var func = new Function("dose", "weight", body);
        return formatNumberValue(func(drug.dose, ctrl.weight));
    };

    ctrl.evalVolume = function(drug) {
        if (!drug.volume) {
            return "";
        }
        var body = "return " + drug.volume + ";"
        var func = new Function("dose", "weight", "dose_2", body);
        return formatNumberValue(func(drug.dose, ctrl.weight, ctrl.evalDose2(drug)));
    };

    ctrl.selectSex = function(sex) {
        ctrl.sex = sex;
        if (!ctrl.airwaysForAge || !ctrl.sex) {
            return;    
        }
        const key = ctrl.sex == 'MALE' ? 'estimatedMaleWeight' : 'estimatedFemaleWeight';
        ctrl.weight = ctrl.airwaysForAge[key];
    };    

    ctrl.allValuesSatisfied = function() {
        return ctrl.weight && ctrl.age;
    };

    ctrl.getBlade = function() {
        return ctrl.airwaysForAge.blade;
    };
    ctrl.getEttDiameter = function() {
        return ctrl.airwaysForAge.cuffedETT;
    };
    ctrl.getLma = function() {
        return ctrl.airwaysForAge.lma;
    };

    ctrl.resetAll = function() {
        ctrl.weight = -1;
        ctrl.age = -1;    
    };

    ctrl.openPanel = function(panel) {
        ctrl.dataShown = panel;
    };
    
    ctrl.closePanel = function() {
        ctrl.dataShown = 'CALCULATOR';
    };

    ctrl.formatAge = function(age) {
        if (age == "0 month") {
            return "בן יומו";
        }
        if (age == "1 month") {
            return "חודש";
        }
        if (age == "2 month") {
            return "חודשיים";
        }        
        if (age == "1 year") {
            return "שנה";
        }
        if (age == "2 year") {
            return "שנתיים";
        }
        return age.replace("month", "חודשים").replace("year", "שנים");
    }

    init();
}]);

app.directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var prevValue = '';
            element.on('click', function () {
                if (!$window.getSelection().toString()) {                                        
                    this.setSelectionRange(0, this.value.length);                    
                }
            });
            element.on('input', function () {
                if(this.checkValidity()){
                    prevValue = this.value;
                  } else {
                    this.value = prevValue;
                    ngModelCtrl.$setViewValue(this.value);
                    ngModelCtrl.$render();
                  }
            });
        }
    };
}]);

app.directive('weights', function() {
    return {
        restrict: 'E',
        templateUrl: 'htmls/weights.html',
        link: function(scope, element, attrs) {
        }
    };
});

app.directive('lma', function() {
    return {
        restrict: 'E',
        templateUrl: 'htmls/lma.html',
        link: function(scope, element, attrs) {
        }
    };
});