/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
function branchGet(req, res) {
	if (typeof req.session.user !== 'undefined') {
		if (typeof req.query.id !== 'undefined')
			res.redirect('/upload-branch?id=' + req.query.id);
	}
	else res.redirect('/');
}

module.exports = {
	branchGet: branchGet
}