function documentGet(req, res) {
    if (typeof req.session.user !== 'undefined') {
		res.render('document',{
			// replace w/ dynamic document name from querystring
			title: 'HelloWorld.txt',
			// replace w/ dynamic document description
			subtitle: 'A file with basic text',
			hasHeader: true,
			
			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			hasHeaderDownload: true,
			fileSize: '7kb',
			uploadDate: '9/9/17',
			uploadTime: '10:10 AM',

			footerBorder: true,
			hasLogout: true
		});
	}
	else {
		res.redirect('/');
	}
}

module.exports = {
    documentGet: documentGet
}