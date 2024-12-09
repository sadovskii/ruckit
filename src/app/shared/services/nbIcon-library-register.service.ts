import { Injectable } from "@angular/core";
import { NbIconLibraries } from "@nebular/theme";
import * as icons from '../../../assets/ruckit-icons';

@Injectable()
export class IconRegisterService {
    constructor(private iconLibraries: NbIconLibraries) {
        this.iconLibraries.registerSvgPack('ruckit-28', 
            {
                [icons.ruckitAboutExtensionLinear28.name]: icons.ruckitAboutExtensionLinear28.data,
                [icons.ruckitAboutExtensionSolid28.name]: icons.ruckitAboutExtensionSolid28.data,
                [icons.ruckitAchievementsLinear28.name]: icons.ruckitAchievementsLinear28.data,
                [icons.ruckitAchievementsSolid28.name]: icons.ruckitAchievementsSolid28.data,
                [icons.ruckitBlacklistLinear28.name]: icons.ruckitBlacklistLinear28.data,
                [icons.ruckitBlacklistSolid28.name]: icons.ruckitBlacklistSolid28.data,
                [icons.ruckitGiveFeedbackLinear28.name]: icons.ruckitGiveFeedbackLinear28.data,
                [icons.ruckitGiveFeedbackSolid28.name]: icons.ruckitGiveFeedbackSolid28.data,
                [icons.ruckitHideListLinear28.name]: icons.ruckitHideListLinear28.data,
                [icons.ruckitHideListSolid28.name]: icons.ruckitHideListSolid28.data,
                [icons.ruckitPasswordLinear28.name]: icons.ruckitPasswordLinear28.data,
                [icons.ruckitPasswordSolid28.name]: icons.ruckitPasswordSolid28.data,
                [icons.ruckitRateExtensionLinear28.name]: icons.ruckitRateExtensionLinear28.data,
                [icons.ruckitRateExtensionSolid28.name]: icons.ruckitRateExtensionSolid28.data,
                [icons.ruckitSettingsLinear28.name]: icons.ruckitSettingsLinear28.data,
                [icons.ruckitSettingsSolid28.name]: icons.ruckitSettingsSolid28.data,
                [icons.ruckitStopScreenLinear28.name]: icons.ruckitStopScreenLinear28.data,
                [icons.ruckitStopScreenSolid28.name]: icons.ruckitStopScreenSolid28.data,
                [icons.ruckitCloserLinear28.name]: icons.ruckitCloserLinear28.data,
                [icons.ruckitCloserSolid28.name]: icons.ruckitCloserSolid28.data,                
            }
        );

        this.iconLibraries.registerSvgPack('ruckit-16',
            {
                [icons.ruckitClosedLock16.name]: icons.ruckitClosedLock16.data,
            }
        );

        this.iconLibraries.registerSvgPack('ruckit-15',
            {
                [icons.ruckitEye15.name]: icons.ruckitEye15.data,
                [icons.RuckitEyeOff15.name]: icons.RuckitEyeOff15.data
            }
        );

        this.iconLibraries.registerSvgPack('ruckit-24',
            {
                [icons.RuckitExclamation24.name]: icons.RuckitExclamation24.data,
                [icons.RuckitCheck24.name]: icons.RuckitCheck24.data
            }
        );

        this.iconLibraries.registerSvgPack('ruckit-21',
            {
                [icons.RuckitCross21.name]: icons.RuckitCross21.data
            }
        )
    }
}