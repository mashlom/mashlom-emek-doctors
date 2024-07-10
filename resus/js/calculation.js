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
    return { doseBeforeDilution, unitsBeforeDilution, doseForDilution, unitsForDilution};
    
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

function calcDripsInstructionDict(dripDefinitions, childKg){
    let dripsInstructionsDict = {}
    for (i = 0; i < dripDefinitions.length; ++i) {
        dripsInstructionsDict[dripDefinitions[i].name] = calcDilutionPerKg(dripDefinitions[i], childKg);
    }

    return dripsInstructionsDict;
}

function prettifyDripsPrint(dripDefinitions, dripsInstructionsDict, childKg){
    UIDripsData = {};
    for (i = 0; i < dripDefinitions.length; ++i) {
        if (dripDefinitions[i].name in dripsInstructionsDict) {
            UIDripsData[dripDefinitions[i].name] = 
                {
                    tableMessage: createDripTableMessage(dripDefinitions[i], dripsInstructionsDict[dripDefinitions[i].name], childKg),
                    tooltipMessage: createTooltipMessage(dripDefinitions[i], dripsInstructionsDict[dripDefinitions[i].name], childKg)
                }
        }   
    }
    return UIDripsData;
}

function createDripTableMessage(drugDefintion, caseInstruction){
    return `${drugDefintion.name}: add ${caseInstruction.doseForDilution} ${caseInstruction.unitsForDilution} in ${drugDefintion.default_dilution_volume_ml} ml`;
}

function createTooltipMessage(drugDefintion, caseInstruction, childKg){
    let tooltip = `${drugDefintion.name}: Data used for calculation: `;
    if (drugDefintion.dose_per_kg_per_min){
        tooltip += `Dose speed ${drugDefintion.dose_per_kg_per_min} ${drugDefintion.dose_unit}/Kg/min=${drugDefintion.default_dilution_volume_ml}ml/Hr. `;
    }
    else if (drugDefintion.dose_per_kg_per_hour){
        tooltip += `Dose speed: ${drugDefintion.dose_per_kg_per_hour} ${drugDefintion.dose_unit}/Kg/Hr=${drugDefintion.default_dilution_volume_ml}ml/Hr. `;
    }
    else{
        tooltip = "no data...";
    }
    tooltip += `Child Weight: ${childKg}Kg. Total dose before dilution=${caseInstruction.doseBeforeDilution} ${caseInstruction.unitsBeforeDilution}. 
    Dilution of ${drugDefintion.default_dilution_volume_ml}ml and target of ${drugDefintion.target_volume_ml_per_hour}ml/Hr
    you need to add: ${caseInstruction.doseForDilution} ${caseInstruction.unitsForDilution} in ${drugDefintion.default_dilution_volume_ml}ml.
    Notice: Allowed Range is :${drugDefintion.allowed_dose_range}`;

    return tooltip;
}


function calcDrips(dripDefinitions, childKg){
    dict = calcDripsInstructionDict(dripDefinitions, childKg);
    return prettifyDripsPrint(dripDefinitions, dict, childKg);
}






