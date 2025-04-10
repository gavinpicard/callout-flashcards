import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon } from 'obsidian';
import { FlashcardView } from "./view";
import { extractCallouts } from "./utils";
import { CARDS_SVG, RETURN_SVG } from "./icons";


export const VIEW_TYPE_FLASHCARD = "flashcard-view";
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();


    addIcon("cards", CARDS_SVG);   // This creates an icon in the left ribbon.

    const ribbonIconEl = this.addRibbonIcon('cards', 'Callout Flashcards', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      this.activateFlashcardView();
    });
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-flashcard-view',
      name: 'Open Flashcard View',
      callback: () => {
        this.activateFlashcardView();
      }
    });
    // This adds an editor command that can perform some operation on the current editor instance

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    /*
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new SampleModal(this.app).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
      }
    });*/

    // This adds a settings tab so the user can configure various aspects of the plugin
    //this.addSettingTab(new SampleSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt);
    });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

    this.registerView(
      VIEW_TYPE_FLASHCARD,
      (leaf) => new FlashcardView(leaf)
    );
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateFlashcardView() {
    const { workspace } = this.app;

    const activeLeaf = workspace.getMostRecentLeaf();
    if (!activeLeaf) return;

    if (activeLeaf?.getViewState().type == "flashcard-view") {
      console.log("hello!");
      const currView = activeLeaf.view as FlashcardView;
      await activeLeaf.openFile(currView.getSource());
      return;
    }

    const leaf = workspace.getLeaf();
    if (!leaf) return;

    const file = workspace.getActiveFile();
    if (!file) return;

    const content = await this.app.vault.read(file);
    const flashcards = extractCallouts(content);

    await leaf.setViewState({
      type: "flashcard-view",
      active: true
    })

    const view = leaf.view;
    if (view instanceof FlashcardView) {
      view.setFlashcards(flashcards);
      view.setSource(file);
    }

    workspace.revealLeaf(leaf);
  }
}

/*
class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}*/
