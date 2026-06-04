const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

// weapon
// node .\scripts\download.js Lone_Barge_icon.png weapon_Lone_Barge.png
// node .\scripts\download.js Lupine_Scarlet_icon.png weapon_Lupine_Scarlet.png
// node .\scripts\download.js Brigand's_Calling_icon.png weapon_Brigands_Calling.png

// character
// node .\scripts\download.js Zhuang_Fangyi_icon.png character_Zhuang_Fangyi.png
// node .\scripts\download.js Mi_Fu_icon.png character_Mi_Fu.png
// node .\scripts\download.js Camille_icon.png character_Camille.png

// fraction
// node .\scripts\download.js Endfield_Industries.png fraction_endfield_industries
// node .\scripts\download.js Rhodes_Island.png fraction_rhodes_island.png
// node .\scripts\download.js Hongshan.png fraction_HAS.png
// node .\scripts\download.js UWST.png fraction_UWST.png
// node .\scripts\download.js TGCC.png fraction_TGCC.png

// class
// node .\scripts\download.js Striker.png class_Striker.png
// node .\scripts\download.js Defender.png class_Defender.png
// node .\scripts\download.js Guard.png class_Guard.png
// node .\scripts\download.js Support.png class_Support.png
// node .\scripts\download.js Caster.png class_Caster.png
// node .\scripts\download.js Defender.png class_Defender.png
// node .\scripts\download.js Vanguard.png class_Vanguard.png

// element
// node .\scripts\download.js Physical.png element_Physical.png
// node .\scripts\download.js Heat.png element_Heat.png
// node .\scripts\download.js Cryo.png element_Cryo.png
// node .\scripts\download.js Nature.png element_Nature.png
// node .\scripts\download.js Electric.png element_Electric.png

// weaponcategory
// node .\scripts\download.js Great_Sword.png weaponcategory_GreatSword.png
// node .\scripts\download.js Polearm.png weaponcategory_Polearm.png
// node .\scripts\download.js Arts_Unit.png weaponcategory_Arts_Unit.png
// node .\scripts\download.js Handcannon.png weaponcategory_handcannon.png
// node .\scripts\download.js Sword.png weaponcategory_sword.png

// attribute
// node .\scripts\download.js WIL.png attribute_Will.png
// node .\scripts\download.js STR.png attribute_Strength.png
// node .\scripts\download.js INT.png attribute_Intellect.png
// node .\scripts\download.js AGI.png attribute_Agility.png

// protocol_space
// node .\scripts\download.js Advanced_Cognitive_Carrier.png stage_protocol_space_operator_exp.png
// node .\scripts\download.js Protoset.png stage_protocol_space_promotions.png
// node .\scripts\download.js T-Creds.png stage_protocol_space_t-creds.png
// node .\scripts\download.js Protohedron.png stage_protocol_space_skill_up.png
// node .\scripts\download.js Arms_INSP_Set.png stage_protocol_space_weapon_exp.png
// node .\scripts\download.js Heavy_Cast_Die.png stage_protocol_space_weapon_tune.png

// crisis_drills
// node .\scripts\download.js D96_Steel_Sample_4.png stage_crisis_drills_hazardous_material_collection_site.png
// node .\scripts\download.js Metadiastima_Photoemission_Tube.png stage_crisis_drills_hazardous_material_landfill.png
// node .\scripts\download.js Tachyon_Screening_Lattice.png stage_crisis_drills_hazardous_material_management_room.png
// node .\scripts\download.js Quadrant_Fitting_Fluid.png stage_crisis_drills_hazardous_material_institute.png
// node .\scripts\download.js Triphasic_Nanoflake.png stage_crisis_drills_hazardous_material_containment_vault.png

// re-crisis
// node .\scripts\download.js Rhodagn_the_Bonekrushing_Fist_sprite.png stage_re-crisis_rhodagn.png
// node .\scripts\download.js Triaggelos_sprite.png stage_re-crisis_triaggelos.png
// node .\scripts\download.js Marble_Aggelomoirai_palesent_sprite.png stage_re-crisis_marble_aggelomoirai.png
// node .\scripts\download.js Ruan_Yi_sprite.png stage_re-crisis_ruan_yi.png
// node .\scripts\download.js Nefarith%2C_%22Bonekrusher%22_sprite.png stage_re-crisis_nefarith.png


function downloadImage(url, outputPath, force) {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });

    if (!force && fs.existsSync(outputPath)) {
        return;
    }

    const client = url.startsWith('https') ? https : http;

    client.get(url, {
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0'}
    }, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Failed: ${response.statusCode}`);
            response.resume();
            return;
        }

        const file = fs.createWriteStream(outputPath);

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${outputPath}`);
        });
    }).on('error', (err) => {
        console.error(err.message);
    });
}

const image = process.argv[2];
let imgName = process.argv[3];
let force = process.argv[4] ?? undefined;

if (!image || !imgName) {
    console.error('Usage: node download-image.js <image> <img-name>');
    process.exit(1);
}

downloadImage(
    `https://endfield.wiki.gg/images/thumb/${image}/1000px-${image}`,
    `scripts/images/${imgName.split('_')[0]}/${imgName.toLowerCase()}`,
    !!force
);