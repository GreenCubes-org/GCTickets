/**
 * MiscController
 *
 * @module :: Controller
 * @description :: Контроллер различного мелкого функционала.
 */

module.exports = {

	apiRoot: function (req, res) {
		var apiRootURL = "https://help.greencubes.org/api";
		
		res.json({
			user_url: apiRootURL + "/users/{user}",
			current_user_url: apiRootURL + "/user",
			tickets_url: apiRootURL + "/tickets",
			questions_url: apiRootURL + "/questions",
			meta_url: apiRootURL + "/meta",
			rate_limit_url: apiRootURL + "/rate_limit",
			documentation_url: "https://wiki.greencubes.org/Система_поддержки/API"
		});
	}
};
