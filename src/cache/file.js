import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import denodeify from 'denodeify';
import Base from './base';

export default class extends Base {
  constructor(compressor, env) {
    super(compressor);

    this.rootDir = env.CACHE_STORE_PATH || '/tmp/sparql-proxy/cache';

    console.log(`cache directory is ${this.rootDir}`);
  }

  async get(key) {
    const _path = this.getPath(key);

    try {
      const data = await denodeify(fs.readFile)(_path);

      return await this.deserialize(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      } else {
        throw error;
      }
    }
  }

  async put(key, obj) {
    const _path = this.getPath(key);
    const data  = await this.serialize(obj);

    await denodeify(mkdirp)(path.dirname(_path));
    await denodeify(fs.writeFile)(_path, data);
  }

  async purge() {
    await denodeify(rimraf)(this.rootDir);
  }

  getPath(key) {
    return path.join(this.rootDir, key.slice(0, 2), key.slice(2, 4), key);
  }
}
