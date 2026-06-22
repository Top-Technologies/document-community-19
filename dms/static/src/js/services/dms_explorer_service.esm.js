/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState } from "@odoo/owl";

/**
 * DmsExplorerService manages the global state of the Windows-like explorer.
 * It ensures that the Sidebar, Breadcrumbs, and Main Grid are always synchronized.
 */
class DmsExplorerService {
    constructor(orm) {
        this.orm = orm;
        this.state = useState({
            currentDirectoryId: null,
            currentPath: [],
            viewMode: 'grid', // 'grid' or 'list'
            selection: new Set(),
        });
        this.events = new Map();
    }

    /**
     * Changes the active directory and updates the state.
     * @param {number} directoryId
     */
    async setDirectory(directoryId) {
        if (this.state.currentDirectoryId === directoryId) return;

        this.state.currentDirectoryId = directoryId;

        // Update breadcrumb path from backend
        const path = await this.orm.call(
            "dms.directory",
            "get_breadcrumb_path",
            [directoryId]
        );
        this.state.currentPath = path;

        this._emit("directory_changed", { directoryId, path });
    }

    /**
     * Toggles the view mode between grid and list.
     */
    toggleViewMode() {
        this.state.viewMode = this.state.viewMode === 'grid' ? 'list' : 'grid';
        this._emit("view_mode_changed", { viewMode: this.state.viewMode });
    }

    /**
     * Simple event emitter for internal component synchronization.
     */
    _emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(cb => cb(data));
        }
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }
}

export const dmsExplorerService = {
    defaults: () => ({}),
    start(env, client, options) {
        const service = new DmsExplorerService(env.services.orm);
        return service;
    },
};

registry.category("services").add("dms_explorer_service", dmsExplorerService);
