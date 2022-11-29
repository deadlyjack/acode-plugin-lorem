import plugin from '../plugin.json';
import { LoremIpsum } from 'lorem-ipsum';

const prompt = acode.require('prompt');
const select = acode.require('select');

class AcodePlugin {
  /** @type {LoremIpsum} */
  #lorem;

  async init() {
    this.#lorem = new LoremIpsum();
    this.quickRun = this.quickRun.bind(this);

    this.#commands.forEach((command) => {
      editorManager.editor.commands.addCommand(command);
    });
  }

  async quickRun() {
    const size = await prompt('Words', 10);
    if (!size) return;
    const text = this.#lorem.generateWords(+size);
    editorManager.editor.insert(text);
  }

  async run() {
    const res = await select('Lorem Ipsum', [
      'Words',
      'Sentences',
      'Paragraphs',
    ], {
      default: 'Words',
    });
    if (!res) return;
    const size = await prompt(res, 10);
    if (!size) return;
    const text = this.#lorem[`generate${res}`](+size);
    editorManager.editor.insert(text);
  }

  async destroy() {
    this.#commands.forEach((command) => {
      editorManager.editor.commands.removeCommand(command);
    });
  }

  get #commands() {
    return [
      {
        name: 'quicklorem',
        description: 'Quick Lorem Ipsum',
        exec: this.quickRun.bind(this),
      },
      {
        name: 'lorem',
        description: 'Lorem Ipsum',
        exec: this.run.bind(this),
      }
    ];
  };
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(plugin.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    acodePlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}