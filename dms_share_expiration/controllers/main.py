import werkzeug
from odoo import fields
from odoo.http import request

from odoo.addons.dms.controllers.portal import CustomerPortal as DmsCustomerPortal


class CustomerPortal(DmsCustomerPortal):
    """Extend portal controller to check share link expiration."""

    def _dms_check_access(self, model, res_id, access_token=None):
        """Override to check expiration date before granting access."""
        # First check using dms.share.link
        if access_token and model == 'dms.file':
            share_link = request.env['dms.share.link'].sudo().search([
                ('access_token', '=', access_token),
                ('file_id', '=', res_id)
            ], limit=1)
            
            if share_link:
                # Check 1: Permission none
                if share_link.permission == 'none':
                    raise werkzeug.exceptions.Forbidden()
                
                # Check 2: Internal access
                if share_link.access_type == 'internal':
                    if not request.env.user.has_group('base.group_user'):
                        raise werkzeug.exceptions.Forbidden()

                # Check 3: Read permission blocking POST/PUT/DELETE
                if share_link.permission == 'read':
                    if request.httprequest.method != 'GET':
                        raise werkzeug.exceptions.Forbidden()

                # Check expiration
                if share_link.expiration_date and share_link.expiration_date < fields.Date.today():
                    return False
                # Valid share link - grant access
                return request.env[model].sudo().browse(res_id)
        
        # Fall back to default behavior
        return super()._dms_check_access(model, res_id, access_token)
