import {CustomCost, ExponentialCost} from "./api/Costs";
import { Localization } from "./api/Localization";
import {BigNumber, parseBigNumber} from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import {Utils} from "./api/Utils";
import {ui} from "./api/ui/UI";
import {Thickness} from "./api/ui/properties/Thickness";
import {TextAlignment} from "./api/ui/properties/TextAlignment";
import {FontAttributes} from "./api/ui/properties/FontAttributes";
import {TouchType} from "./api/ui/properties/TouchType";
import { Vector3 } from "../../../Projects/theory-sdk/api/Vector3";
import {Color} from "./api/ui/properties/Color";
import {CornerRadius} from "./api/ui/properties/CornerRadius";
import {game} from "./api/Game";

var id = "Tankshells";
var name = "Tankshells";
var description = "Tankshells";
var authors = "Door";
var version = 1;

var currency;
var c1, c2, P;
var d, L, m;
var c1Exp, c2Exp;
var FunctionLVL;

var achievement1, achievement2;
var chapter1, chapter2;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades


    // C1
    {
        let getDesc = (level) => "m=" + getm(level).toString(0) + "mg";
        m = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(2, Math.log2(1.3))));
        m.getDescription = (_) => Utils.getMath(getDesc(m.level));
        m.getInfo = (amount) => Utils.getMathTo(getDesc(m.level), getDesc(m.level + amount));
    }



    // P
    {
        let getDesc = (level) => "P=" + getP(level).toString(2) + "mpa";
        P = theory.createUpgrade(2, currency, new FirstFreeCost(new ExponentialCost(1, Math.log2(2))));
        P.getDescription = (_) => Utils.getMath(getDesc(P.level));
        P.getInfo = (amount) => Utils.getMathTo(getDesc(P.level), getDesc(P.level + amount));
    }

    // L
    {
        let getDesc = (level) => "L=" + getL(level).toString(3) + "mm";
        L = theory.createUpgrade(3, currency, new ExponentialCost(10, Math.log2(1.3)));
        L.getDescription = (_) => Utils.getMath(getDesc(L.level));
        L.getInfo = (amount) => Utils.getMathTo(getDesc(L.level), getDesc(L.level + amount));
    }



    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e4);
    theory.createBuyAllUpgrade(1, currency, 1e7);
    theory.createAutoBuyerUpgrade(2, currency, 1e10);

    ///////////////////////
    //// Milestone Upgrades

    theory.setMilestoneCost(new LinearCost(0, 1));
    {
    d = theory.createMilestoneUpgrade(0, 5);
    d.description = "Increase the Diameter of the barrel by 15cm";
    d.boughtOrRefunded = (_) => 
    {
    d.info = (d.level * 15 + 15) + "cm to " + ((d.level + 1) * 15 + 15) + "cm";
    theory.invalidatePrimaryEquation();
    };}


    // Function
    
        FunctionLVL = theory.createMilestoneUpgrade(2, 1);
        FunctionLVL.description = "Calculate the impact force of the shell";
        FunctionLVL.boughtOrRefunded = (_) => 
        {
        FunctionLVL.info = "Function Level: " + FunctionLVL.level;
        theory.invalidatePrimaryEquation();
        };
    
    

    
    
    /////////////////
    //// Achievements
    // achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => c1.level > 1);
    // achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of c2?", () => c2.level > 1);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "The diameter...", "So you decided to increase something\n\nThe diameter of course\nbigger round equals bigger result, no?\n\nThis HOPEFULLY will speed up the progress...\nor?", () => d.level > 0);
    chapter2 = theory.createStoryChapter(1, "You cant continue like this...", "Your calculations are slowing down...\nTo a point where you can't continue...\n\nA function change is needed.\nNow\n\nBut what will you do?\n\n\n\nImpact...\nImpact force of the shell...\nYes.\nYES!\nThis is it.\nThis will be the breaktrough.", () => currency.value > 1e35);

    updateAvailability();
}

var updateAvailability = () => {
    FunctionLVL.isAvailable = (currency.value > 1e40);
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    currency.value += 10 * dt * bonus *  getm(m.level) *
                                    Math.sqrt(
                                    (Math.PI *
                                    getP(P.level) *
                                    getL(L.level+1) *
                                    Math.pow((d.level+1)*15, 2)
                                    )
                                    /(2 * getm(m.level) + 1)
                                    );
}

var getPrimaryEquation = () => "\\dot{\\rho}" + "=vm";
                               

var getSecondaryEquation = () => {

    theory.secondaryEquationScale = 1.5;
    theory.secondaryEquationHeight = 100;
    let result ="v = \\sqrt\\frac{P \\pi d^2 \\L}{2m}";
    return result;

};
var getTertiaryEquation = () => theory.latexSymbol + "=" + "\\max\\rho" + "^{0.1}";
var getPublicationMultiplier = (tau) => tau.pow(3)/3;
var getPublicationMultiplierFormula = (tau) => "\\frac{{" + tau + "}^{3}}{3}";
var getTau = () => currency.value.pow(0.1);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getP = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getL = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);


var getm = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(10), currency.symbol];

init();
