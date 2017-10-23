import {getAccentableIcons} from '../../helpers/fs';
import * as fs from 'fs';

import { getAbsolutePath, getDefaultValues, getThemeIconsByContributeID, getThemeIconsContribute } from "../../helpers/fs";
import { getCurrentThemeIconsID } from "../../helpers/vscode";
import { getCustomSettings, isAccent, isMaterialThemeIcons } from "../../helpers/settings";

import { CHARSET } from "../../consts/files";
import { IPackageJSONThemeIcons } from "../../interfaces/ipackage.json";
import { IThemeIcons } from "../../interfaces/itheme-icons";

function replaceIconPathWithAccent(iconPath: string, accentName: string): string {
  return iconPath.replace('.svg', `.accent.${ accentName }.svg`);
}

export const THEME_ICONS = () => {
  let deferred: any = {};
  let promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  let themeIconsID: string = getCurrentThemeIconsID();

  if (isMaterialThemeIcons(themeIconsID)) {
    let customSettings = getCustomSettings();
    let defaults = getDefaultValues();
    let accentName = customSettings.accent;
    let variantName: string = customSettings.themeColours === undefined ? '' : customSettings.themeColours;
    let themeContribute: IPackageJSONThemeIcons = getThemeIconsContribute(themeIconsID);
    let theme: IThemeIcons = getThemeIconsByContributeID(themeIconsID);
    let themepath: string = getAbsolutePath(themeContribute.path);

    if (isAccent(accentName, defaults)) {
      let _accentName = accentName.replace(/\s+/, '-');

      getAccentableIcons().forEach(iconname => {
        let distIcon = (theme.iconDefinitions as any)[iconname];
        let outIcon = (defaults.icons.theme.iconDefinitions as any)[iconname];

        if (typeof distIcon === 'object' && typeof outIcon === 'object') {
          distIcon.iconPath = replaceIconPathWithAccent(outIcon.iconPath, _accentName)
        }
      })

      // theme.iconDefinitions._folder_open.iconPath = defaults.icons.theme.iconDefinitions._folder_open.iconPath.replace('.svg', `.accent.${ _accentName }.svg`);
      // theme.iconDefinitions._folder_open_build.iconPath = defaults.icons.theme.iconDefinitions._folder_open_build.iconPath.replace('.svg', `.accent.${ _accentName }.svg`);
    } else {

      getAccentableIcons().forEach(iconname => {
        let distIcon = (theme.iconDefinitions as any)[iconname];
        let outIcon = (defaults.icons.theme.iconDefinitions as any)[iconname];

        distIcon.iconPath = outIcon.iconPath;
      });
      // theme.iconDefinitions._folder_open.iconPath = defaults.icons.theme.iconDefinitions._folder_open.iconPath;
      // theme.iconDefinitions._folder_open_build.iconPath = defaults.icons.theme.iconDefinitions._folder_open_build.iconPath;
    }

    theme.iconDefinitions._folder_dark.iconPath = defaults.icons.theme.iconDefinitions._folder_dark.iconPath.replace('.svg', `${ variantName }.svg`);
    theme.iconDefinitions._folder_dark_build.iconPath = defaults.icons.theme.iconDefinitions._folder_dark_build.iconPath.replace('.svg', `${ variantName }.svg`);
    // theme.iconDefinitions._file_folder.iconPath = defaults.icons.theme.iconDefinitions._file_folder.iconPath.replace('.svg', `${ variantName }.svg`);
    // theme.iconDefinitions["_file_folder-build"].iconPath = defaults.icons.theme.iconDefinitions["_file_folder-build"].iconPath.replace('.svg', `${ variantName }.svg`);
    theme.iconDefinitions._folder_light.iconPath = defaults.icons.theme.iconDefinitions._folder_light.iconPath.replace('.svg', `${ variantName }.svg`);
    theme.iconDefinitions["_folder_light_build"].iconPath = defaults.icons.theme.iconDefinitions["_folder_light_build"].iconPath.replace('.svg', `${ variantName }.svg`);

    fs.writeFile(themepath, JSON.stringify(theme), { encoding: CHARSET }, (error) => {
      if (error) {
        deferred.reject(error);
        return;
      }

      deferred.resolve();
    });
  } else {
    deferred.resolve();
  }

  return promise;
}