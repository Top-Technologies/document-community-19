/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class ExplorerSidebar extends Component {
    static components = { TreeItem: "dms.TreeItem" };

    setup() {
        this.explorerService = useService("dms_explorer_service");
        this.state = useState({
            rootDirectories: [],
        });

        this.onWillStartAsync = async () => {
            await this._loadRootDirectories();
        };
    }

    async _loadRootDirectories() {
        this.state.rootDirectories = await this.explorerService.orm.call(
            "dms.directory",
            "search_read",
            [[["is_root_directory", "=", true]], ["id", "name"]]
        );
    }

    async onDirectoryClick(ev, directoryId) {
        ev.stopPropagation();
        await this.explorerService.setDirectory(directoryId);
    }
}

ExplorerSidebar.template = "dms.ExplorerSidebar";

export { ExplorerSidebar };
