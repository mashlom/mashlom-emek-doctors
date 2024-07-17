function calcDilutionPerKg(drugData, kg){
    if (drugData.name === 'Propofol 10%'){
        return { dose_to_add: '00000', unit: 'TBD' };;
    }

    let drug_per_hour = 0;
    if (drugData.dose_per_kg_per_min){
        drug_per_hour = drugData.dose_per_kg_per_min * 60;
    } else if (drugData.dose_per_kg_per_hour){
        drug_per_hour = drugData.dose_per_kg_per_hour;
    }
    else {
        return { dose_to_add: drugData.name, unit: 'Drug With No Data' };;
    }

    const dosePerKg = drug_per_hour * kg;
    const dose_to_add = (drugData.default_dilution_volume_ml / drugData.target_volume_ml_per_hour) * dosePerKg;
    const {dose: doseForDilution, units: unitsForDilution} = prettifyUnits(dose_to_add, drugData.dose_unit);
    const {dose: doseBeforeDilution, units: unitsBeforeDilution} = prettifyUnits(dosePerKg, drugData.dose_unit);
    return { doseBeforeDilution: formatNumber(doseBeforeDilution), unitsBeforeDilution, doseForDilution: formatNumber(doseForDilution), unitsForDilution};    
}

function formatNumber(num) {
    return parseFloat(num.toFixed(2));
}

function prettifyUnits(dose, units){
    if (dose < 1000){
        return { dose, units }
    } else {
        if (units === 'mcg'){
            return {dose: dose/1000, units: 'mg'}
        }
        return {dose, units}
    }
}






