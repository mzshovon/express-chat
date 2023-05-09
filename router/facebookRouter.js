const express = require('express');
const adsSdk = require('facebook-nodejs-business-sdk');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {checkLogin} = require('../middlewares/common/checkLogin');
const attachmentUpload = require('../middlewares/inbox/attachmentUpload');
const router = express.Router();

const page_title = "Inbox";

// Login page
router.post("/", (req,res) => {
    const accessToken = process.env.FACEBOOK_AD_ACCESS_TOKEN;
    const api = adsSdk.FacebookAdsApi.init(accessToken);
    const AdAccount = adsSdk.AdAccount;
    const Campaign = adsSdk.Campaign;
    const account = new AdAccount(`act_${process.env.AD_ACCOUNT_ID}`);
    account
    .createCampaign(
        [Campaign.Fields.Id],
        {
        [Campaign.Fields.name]: 'Page likes campaign', // Each object contains a fields map with a list of fields supported on that object.
        [Campaign.Fields.status]: Campaign.Status.paused,
        [Campaign.Fields.special_ad_categories]: "CREDIT",
        [Campaign.Fields.objective]: Campaign.Objective.page_likes
        }
    )
    .then((result) => {
        console.log("result",result);
    })
    .catch((error) => {
        console.log("err",error);
    });
    res.json({
        ad_ac_id : account.id
    });
});

module.exports = router;