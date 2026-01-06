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
    app.expect.title().to.equal(this.app.props.title);
    expectAllVisible(this.app, [
      "@splashScreen",
      "@splashClose",
    ]);
    expectAllNotPresent(this.app, [
      "@videoDialog",
      "@infoSheet"
    ]);

    this.app.click("@splashClose");
    expectAllNotPresent(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);

    expectAllVisible(this.sections.topContent, [
      "@videoIcon",
      "@showHideButton",
      "@resetIcon",
      "@textIcon"
    ]);

    const bottomContent = this.sections.bottomContent;
    expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits",
    ]);

    bottomContent.expect.elements("@creditIcon").count.to.equal(bottomContent.props.creditIconCount);

    this.app.waitForElementVisible("@userExperience", 30_000);
    this.sections.userExperience.click("@closeButton");
    this.app.expect.element("@userExperience").to.not.be.present;

    await percyScreenshot(this.driver, "Initial");
  },

  'Layer buttons': async function() {
    const bottomContent = this.sections.bottomContent;
    bottomContent.click("@hubbleButton");
    bottomContent.expect.element("@slider").value.to.equal("0");

    bottomContent.click("@jwstButton");
    bottomContent.expect.element("@slider").value.to.equal("100");

    const topContent = this.sections.topContent;
    topContent.click("@showHideButton");

    await percyScreenshot(this.driver, "Images hidden");
    
    expectAllNotPresent(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider"
    ]);
    bottomContent.expect.element("@credits").to.be.visible;

    topContent.click("@showHideButton");
    expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits"
    ]);


    await percyScreenshot(this.driver, "Images shown");
  },

  'Open video': async function() {
    this.sections.topContent.click("@videoIcon");
    this.app.expect.element("@videoDialog").to.be.visible;
    expectAllVisible(this.sections.videoDialog, [
      "@video", "@closeIcon",
    ]);

    await percyScreenshot(this.driver, "Video open");

    this.sections.videoDialog.click("@closeIcon");
    this.app.expect.element("@videoDialog").to.not.be.present;
  },

  'Info text': async function(browser: NightwatchBrowser) {
    this.sections.topContent.click("@textIcon");
    this.app.expect.element("@infoSheet").to.be.visible;

    const infoSheet = this.sections.infoSheet;
    expectAllVisible(infoSheet, [
      "@closeIcon",
      "@infoTabHeader",
      "@wwtTabHeader",
      "@infoText"
    ]);
    infoSheet.expect.element("@wwtText").to.not.be.present;
    infoSheet.expect.elements("@tabHeader").count.to.equal(infoSheet.props.tabCount);

    await percyScreenshot(this.driver, "Info sheet open");
    
    // getWindowSize seems to return the height of the browser
    // (that is, including the tab and address bars)
    // but we want just the height of the viewport
    this.app.getElementSize("html", (windowSize) => {
      this.app.getElementSize("@mainContent", (mainContentSize) => {
        const wsize = windowSize.value as WindowSize;
        const csize = mainContentSize.value as WindowSize;
        assert(Math.round(csize.height - 0.66 * wsize.height) < 2);
        browser.assert.equal(wsize.width, csize.width);
      });
    });

    infoSheet.click("@wwtTabHeader");
    infoSheet.expect.element("@infoText").to.be.present;
    infoSheet.expect.element("@infoText").to.not.be.visible;

    await percyScreenshot(this.driver, "Info sheet - WWT Tab");

    infoSheet.click("@infoTabHeader");
    infoSheet.expect.element("@wwtText").to.be.present;
    infoSheet.expect.element("@wwtText").to.not.be.visible;

    await percyScreenshot(this.driver, "Info sheet - Info Tab");
  },

  after: async function(browser: NightwatchBrowser) {
    await browser.end();
  }
};

export default tests;
