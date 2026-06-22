/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

import { ExplorerRenderer } from "./explorer_renderer";
import { ExplorerSidebar } from "./explorer_sidebar";
import { ExplorerBreadcrumbs } from "./explorer_breadcrumbs";

class ExplorerController extends Component {
    static components = {
        ExplorerRenderer,
        ExplorerSidebar,
        ExplorerBreadcrumbs,
    };

    setup() {
        this.explorerService = useService("dms_explorer_service");
        this.state = useState({
            children: [],
        });

        // Subscribe to directory changes to refresh the main content
        this.explorerService.on("directory_changed", (data) => {
            this._loadDirectoryContent(data.directoryId);
        });

        // Initialize with a default directory if none is set
        this.onWillStartAsync = async () => {
            if (!this.explorerService.state.currentDirectoryId) {
                await this._initDefaultDirectory();
            } else {
                await this._loadDirectoryContent(this.explorerService.state.currentDirectoryId);
            }
        };
    }

    async _initDefaultDirectory() {
        // Fetch root directories to find a starting point
        const rootDirs = await this.explorerService.orm.call(
            "dms.directory",
            "search_read",
            [[["is_root_directory", "=", true]], ["id", "name"]]
        );

        if (rootDirs.length > 0) {
            await this.explorerService.setDirectory(rootDirs[0].id);
        }
    }

    async _loadDirectoryContent(directoryId) {
        const children = await this.explorerService.orm.call(
            "dms.directory",
            "get_children",
            [directoryId]
        );
        this.state.children = children;
    }

    get root() {
        return this.explorerService;
    }
}

// Register as a Client Action
registry.category("actions").add("dms_explorer", ExplorerController);
