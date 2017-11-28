/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function editGet(req, res) {
    if (typeof req.session.user !== 'undefined') {
		res.render('edit',{
			title: 'Edit File',
			containerName: 'upload-form',
			hasHeader: true,

			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			hasTitleRowBorder: true,
			footerBorder: true,
			hasLogout: true
		});
	}
	else {
		res.redirect('/');
	}
}

module.exports = {
    editGet: editGet
}