const rp = require('request-promise');
const jar = rp.jar();

module.exports = function ConnectWiseControl(instanceUrl, username, password) {
    {
        var module = {};
        var headers = null;

        /*
            Gets the entire list of sessions from ConnectWise Control.
        */
        module.getSessionGroups = async () => {
            await this.getWebSession();

            return await this.getSessionGroups();
        };

        /**
         * @param { integer } id - The session group's ID.
         */

        /*
            The actual POST request requires the entire list of sessions. We'll be 
            modifying a single group and sending the entire list back for simplicity.
        */
        module.renameSessionGroup = async (oldName, newName) => {
            await this.getWebSession();

            let groups = await this.getSessionGroups();

            groups.map(group => {
                if (group.Name === oldName) {
                    group.Name = newName;
                }
            });

            let body = [];

            body.push(groups); // For some stupid reason. Control has an array inside of an array.

            // Sending in the entire list with the updated group.
            const params = {
                method: 'POST',
                uri: `${instanceUrl}/Services/SessionGroupService.ashx/SaveSessionGroups`,
                body: body,
                jar,
                json: true
            };

            await rp(params);
        };

        getSessionGroups = async () => {
            const params = {
                method: 'POST',
                uri: `${instanceUrl}/Services/SessionGroupService.ashx/GetSessionGroups`,
                jar,
                json: true
            };

            const groups = await rp(params);

            return groups;
        }

        /*
            Signs into the web service and sets the cookie.
        */
        getWebSession = async () => {
            if (!headers) { // Only set to determine if we've already logged in.

                const params = {
                    method: 'POST',
                    uri: `${instanceUrl}/Login?Reason=7`,
                    form: {
                        __VIEWSTATE: '/wEPDwUKMTM5ODA0NTQ4MA8WAh4TVmFsaWRhdGVSZXF1ZXN0TW9kZQIBFgJmD2QWBAIBD2QWAgIFDxYCHgRocmVmBUp+L0FwcF9UaGVtZXMvQ292aS9EZWZhdWx0LmNzcz9fX0NhY2hlPWVjOWZlZWRlLWJkN2MtNGQ0My05N2EzLWE5ZTI4NGJjOGM0NWQCAw9kFgICAQ9kFgZmDw8WAh4EVGV4dAVBWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0IG9mIHRoZSBzeXN0ZW0uIFBsZWFzZSBsb2dpbiB0byBjb250aW51ZS5kZAIBD2QWAmYPZBYCAgUPDw9kFgIeDGF1dG9jb21wbGV0ZQUDb2ZmZWQCBA9kFgJmDxYCHgtfIUl0ZW1Db3VudAIBFgJmD2QWAgIBDw8WBB4PQ29tbWFuZEFyZ3VtZW50BSQxYzM4NGVhNS04OTA2LTRlN2MtOTFjZS1mZjYwN2ViMTQyZTcfAgUVQ29ubmVjdCB3aXRoIE9uZUxvZ2luZGQYAQUUY3RsMDAkTWFpbiRtdWx0aVZpZXcPD2RmZAPfLlxFPzGXFeqly4Xb5GuTABj3SOpY5ZP2tKamFxBQ',
                        __VIEWSTATEGENERATOR: '48701E03',
                        ctl00$Main$userNameBox: username,
                        ctl00$Main$passwordBox: password,
                        ctl00$Main$ctl05: 'Login'
                    },
                    jar,
                    resolveWithFullResponse: true,
                    simple: false
                };

                let res = await rp(params);

                // Setting so the rest of the application can use it.
                headers = res.headers;
            }
        };

        return module;
    }
}