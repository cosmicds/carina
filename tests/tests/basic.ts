import { CarinaPage, CarinaSections } from "../page_objects/Carina";
import {
  EnhancedPageObject,
  NightwatchBrowser,
  NightwatchTests,
  WindowSize
} from "nightwatch";

import { assert } from "chai";

import type { WebDriver } from "selenium-webdriver";
import { percyScreenshot } from "@percy/selenium-webdriver";

import {
  expectAllNotPresent,
  expectAllVisible,
} from "../utils";

type CarinaTests = NightwatchTests & { app: CarinaPage; sections: CarinaSections };

const tests: CarinaTests = {

  // Kinda kludgy, but this makes things work TypeScript-wise
  // We need to do this since the value get initialized in the `before` method
  app: null as unknown as (EnhancedPageObject & CarinaPage),
  sections: null as unknown as CarinaSections,
  driver: null as unknown as WebDriver,

  before: async function(browser: NightwatchBrowser): Promise<void> {
    browser.globals.waitForConditionTimeout = 30000;
    this.app = browser.page.Carina();
    this.sections = this.app.section as CarinaSections;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error The `driver` member is defined
    this.driver = browser.driver;
  },

  'Navigation and loading': function() {
    this.app.navigate().waitForReady();
  },

  'Initial configuration': async function() {
    await app.expect.title().to.equal(this.app.props.title);
    await expectAllVisible(this.app, [
      "@splashScreen",
      "@splashClose",
    ]);
    await expectAllNotPresent(this.app, [
      "@videoDialog",
      "@infoSheet"
    ]);

    await this.app.click("@splashClose");
    await expectAllNotPresent(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);

    await expectAllVisible(this.sections.topContent, [
      "@videoIcon",
      "@showHideButton",
      "@resetIcon",
      "@textIcon"
    ]);

    const bottomContent = this.sections.bottomContent;
    await expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits",
    ]);

    await bottomContent.expect.elements("@creditIcon").count.to.equal(bottomContent.props.creditIconCount);

    await this.app.waitForElementVisible("@userExperience", 30_000);
    await this.sections.userExperience.click("@closeButton");
    await this.app.expect.element("@userExperience").to.not.be.present;

    await percyScreenshot(this.driver, "Initial");
  },

  'Layer buttons': async function() {
    const bottomContent = this.sections.bottomContent;
    await bottomContent.click("@hubbleButton");
    await bottomContent.expect.element("@slider").value.to.equal("0");

    await bottomContent.click("@jwstButton");
    await bottomContent.expect.element("@slider").value.to.equal("100");

    const topContent = this.sections.topContent;
    await topContent.click("@showHideButton");

    await expectAllNotPresent(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider"
    ]);
    await bottomContent.expect.element("@credits").to.be.visible;

    await percyScreenshot(this.driver, "Images hidden");

    await topContent.click("@showHideButton");
    await expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits"
    ]);

    await percyScreenshot(this.driver, "Images shown");
  },

  'Open video': async function() {
    await this.sections.topContent.click("@videoIcon");
    await this.app.expect.element("@videoDialog").to.be.visible;
    await expectAllVisible(this.sections.videoDialog, [
      "@video", "@closeIcon",
    ]);

    await percyScreenshot(this.driver, "Video open");

    await this.sections.videoDialog.click("@closeIcon");
    await this.app.expect.element("@videoDialog").to.not.be.present;

    await percyScreenshot(this.driver, "Video closed");
  },

  'Info text': async function(browser: NightwatchBrowser) {
    await this.sections.topContent.click("@textIcon");
    await this.app.expect.element("@infoSheet").to.be.visible;

    const infoSheet = this.sections.infoSheet;
    await expectAllVisible(infoSheet, [
      "@closeIcon",
      "@infoTabHeader",
      "@wwtTabHeader",
      "@infoText"
    ]);
    await infoSheet.expect.element("@wwtText").to.not.be.present;
    await infoSheet.expect.elements("@tabHeader").count.to.equal(infoSheet.props.tabCount);

    await percyScreenshot(this.driver, "Info sheet open");
    
    // getWindowSize seems to return the height of the browser
    // (that is, including the tab and address bars)
    // but we want just the height of the viewport
    await this.app.getElementSize("html", (windowSize) => {
      this.app.getElementSize("@mainContent", (mainContentSize) => {
        const wsize = windowSize.value as WindowSize;
        const csize = mainContentSize.value as WindowSize;
        assert(Math.round(csize.height - 0.66 * wsize.height) < 2);
        browser.assert.equal(wsize.width, csize.width);
      });
    });

    await infoSheet.click("@wwtTabHeader");
    await infoSheet.expect.element("@infoText").to.be.present;
    await infoSheet.expect.element("@infoText").to.not.be.visible;

    await percyScreenshot(this.driver, "Info sheet - WWT Tab");

    await infoSheet.click("@infoTabHeader");
    await infoSheet.expect.element("@wwtText").to.be.present;
    await infoSheet.expect.element("@wwtText").to.not.be.visible;

    await percyScreenshot(this.driver, "Info sheet - Info Tab");
  },

  after: async function(browser: NightwatchBrowser) {
    await browser.end();
  }
};

export default tests;
