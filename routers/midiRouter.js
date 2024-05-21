const rtpmidi = require('rtpmidi');

module.exports = () => {
  const session = rtpmidi.manager.createSession({
    localName: 'TimeCode Screen Server',
    bonjourName: 'TimeCode Screen Server',
    port: 5006
  });

  const mtc = new rtpmidi.MTC();
  mtc.setSource(session);

  return { session, mtc };
};
