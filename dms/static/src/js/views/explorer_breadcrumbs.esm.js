/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class ExplorerBreadcrumbs extends Component {
    setup() {
        this.explorerService = useService("dms_explorer_service");
    }

    async onNodeClick(ev, directoryId) {
        ev.stopPropagation();
        await this.explorerService.setDirectory(directoryId);
    }

    get path() {
        return this.explorerService.state.currentPath || [];
    }
}

ExplorerBreadcrumbs.template = "dms.ExplorerBreadcrumbs";

export { ExplorerBreadcrumbs };
