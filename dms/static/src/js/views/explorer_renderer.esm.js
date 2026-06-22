/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class ExplorerRenderer extends Component {
    setup() {
        this.explorerService = useService("dms_explorer_service");
        this.state = useState({
            items: [],
        });

        // Subscribe to directory changes to update the grid/list content
        this.explorerService.on("directory_changed", (data) => {
            this._loadContent(data.directoryId);
        });
    }

    async _loadContent(directoryId) {
        const children = await this.explorerService.orm.call(
            "dms.directory",
            "get_children",
            [directoryId]
        );
        this.state.items = children;
    }

    async onItemDoubleClicked(item) {
        if (item.type === 'folder') {
            await this.explorerService.setDirectory(item.id);
        } else {
            // Trigger file open/preview (standard Odoo action or custom preview)
            this.env.services.action.doAction({
                type: 'ir.actions.act_window',
                res_model: 'dms.file',
                res_id: item.id,
                views: [[false, 'form']],
                target: 'current',
            });
        }
    }

    toggleView() {
        this.explorerService.toggleViewMode();
    }

    get viewMode() {
        return this.explorerService.state.viewMode;
    }
}

ExplorerRenderer.template = "dms.ExplorerRenderer";

export { ExplorerRenderer };
