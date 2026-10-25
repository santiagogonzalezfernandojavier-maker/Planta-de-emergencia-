import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {syncCheckout} from './sync.mjs';
// The HTTP server rebuilds on the next version check, without stopping its listener.
syncCheckout(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
