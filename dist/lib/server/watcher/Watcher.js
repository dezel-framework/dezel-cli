"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = require("chokidar");
const events_1 = require("events");
/**
 * @class Watcher
 * @since 0.1.0
 */
class Watcher extends events_1.EventEmitter {
    //--------------------------------------------------------------------------
    // Methods
    //--------------------------------------------------------------------------
    /**
     * @constructors
     * @since 1.0.0
     */
    constructor(server, globs) {
        super();
        this.server = server;
        this.watcher = chokidar_1.watch(globs, {
            ignoreInitial: true,
            ignored: [
                'node_modules/**',
                'bower_components/**',
                '.svn',
                '.git',
                '.hg',
                '.DS_Store',
                '*.swp',
                'thumbs.db',
                'desktop.ini'
            ],
        });
        const onChange = (file) => {
            this.emit('change', file);
        };
        this.watcher.on('add', onChange);
        this.watcher.on('change', onChange);
    }
}
exports.Watcher = Watcher;
