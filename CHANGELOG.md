 
# Changelog
All notable GA release changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## v2.2.10-beta.6 (released@ 12-03-2024)

**Features**

* Implemented new local hangup reasons to provide additional insights into the cause of call hangups.

**Bug Fix**

* Graceful disconnection of the websocket before emitting `onLoginFailed`.
* Resolved a type error issue resulting in: "Cannot assign to read-only property 'uri' of object".
* Preventing the establishment of a new websocket connection if there is an ongoing connection.

Note: The `errorCode` in the callinfo object has been renamed to `code`.

## v2.2.10-beta.5 (released@ 23-02-2024)

**Features**

* Enhanced CallInfo Object by removing `remoteCancelReason` and introducing granular attributes: `reason`, `protocol`, `errorCode`, and `originator`.
* Removed google STUN and implemented plivo STUN Servers to improve reliability. This change is now configurable via the `usePlivoStunServer` flag.

**Bug Fixes**

* Resolved type error issue causing `getHeader is not a function`.
* Improved call management: Calls will now disconnect automatically in the event of a network switch while in the Ringing state.


## v2.2.10-beta.4 (released@ 16-02-2024)

**Features**

* Enhanced Heartbeat timer for improved network monitoring.
* The reason for disconnection/connection is published with the onConnectionChange event. 
* Streamlined the gathering of local media stream during the ringing state for incoming calls.
* Introduced helper methods (isRegistered, isConnecting, and isConnected) for checking the client connection status.

**Bug Fixes**

* Implemented automatic restart of heartbeat service when the browser fails to reconnect the socket.


## v2.2.10-beta.3 (released@ 12-01-2024)

**Features**

* Introduced a new event 'remoteAudioStatus' that signifies the reception status of audio packets from the remote caller.

**Note:**  This feature works only in case of conference and MPC

## v2.2.10-beta.2 (released@ 09-01-2024)

**Bug Fixes**

* Enhanced SDK reconnection logic to optimize scenarios where users attempt to log in while already logged in.
* Added internet access check before registration.

## v2.2.10-beta.1 (released@ 14-12-2023)

**Bug Fixes**

* Fixed an "Invalid State" error that occurred during call hang-up.
* Addressed a Type error encountered when configuring output media devices.
* Limited the Logout() function to execute only during active sessions.

**Features**

* Trigger an event when media permission is revoked.
* Notify users when they speak while muted.


## v2.2.10-beta.0 (released@ 26-10-2023)

**Bug Fixes**

* Fixed: Call mutes when input/output devices change.

**Features**

* Included noise suppression feature to enhance audio quality, which effectively eliminates unwanted background noise during active calls. You can enable or disable this feature using the `enableNoiseReduction` flag.

**Note:** This functionality is not compatible with Safari.

## v2.2.9-beta.0 (released@ 17-10-2023)
**Features**

* Added a new property `remoteCancelReason` under the `CallInfo` object, which indicates the reason for call termination for both incoming and outgoing calls.

**Note:** `remoteCancelReason` will be none during call state: ringing, answered.

## v2.2.9 (released@ 29-09-2023)
**Bug Fixes**

* Fixed: Removed support for the getStats API, as it is no longer available in Chrome versions 117 and beyond.
* Fixed: Removed the predetectOWA functionality.
* Fixed: Issue on audio input/output device mismatch on windows platform.

**Features**

* Added: A new `useDefaultAudioDevice` flag, which allows the SDK to use either the system's default audio device or the recently added device for both input and output on Windows platform. 


## v2.2.8 (released@ 11-09-2023)
**Bug Fixes**

* Fixed: Corrected the handling of stir-verification in incoming call headers.
* Fixed: Fixed audio level discrepancies that occurred when changing input/output devices, ensuring accurate device settings.
* Fixed: Removed DOMError to support latest Typescript versions.
* Fixed: Restored functionality for incoming calls with PCMU codec.
* Fixed: Prevented SDK from logging out when re-registration timed out.
* Fixed: Reduced the time for firing the onConnectionChange event with a disconnected state to within 10 seconds when the SDK disconnects from Plivo servers, previously occurring within a 2-minute interval.


**Features**

* Added: A `refreshRegistrationTimer` flag for user-configurable periodic re-registration by the SDK.
* Added: An `onDtmfReceived` event triggered when the SDK receives DTMF tones.
* Added: Enhanced remote debugging with the collection and transmission of logs to Plivo servers.
* Added: Plivo STUN servers to ensure stable connections.
* Added: A `CALL_RINGING` event signaling the initiation of incoming/outgoing call ringing to Plivo.

## v2.2.7 (released@ 06-06-2022)
**Features**

* Added: New Client Region South-Asia to the existing Client Region list.
* Fixed: The call summary stats are not pushed to Plivo when the call is answered and hung up before the stats socket is open

## v2.2.6 (released@ 13-10-2021)
**Features**

* Added: JavaScript framework detection for enhanced debugging. 

## v2.2.5 (released@ 09-07-2021)
**Features**

* Added: New call quality metrics added in Browser SDK:
  googEchoCancellationReturnLoss
  googEchoCancellationReturnLossEnhancement
  googJitterBufferMs.
* Added: On network change, a new event, ‘CALL_NETWORK’, will now be sent to Call Insights.


## v2.2.4 (released@ 05-07-2021)
**Bug Fixes**

* Fixed: Issue with audio input/output device toggle on Windows platform.
* Fixed: Issue where non-default behavior was not maintained when Bluetooth was added over Headphones in Electron

**Features**

* Added: Attribute called ‘callerName’ to the onIncoming call event. This attribute contains the name of the caller (if set by the initiator of the call) and can be displayed on the user interface.
* Added: Ability to identify custom modifications to the officially released SDK versions.
* Added: Capture audio input/output device toggle events during an active call
* Added: Ability to select between Inband and Outband DTMF during initialization. For more information, refer to the Configuration Parameters section in the detailed reference.

## v2.2.3 (released@ 05-04-2021)
**Bug Fixes**

* Fixed: Issue where one-way audio was observed for the next call after a custom device for input and output was removed.
* Fixed: Issue where call-summary event was not getting sent reliably under unstable network connections.
* Fixed: Issue where an error message was being published (setremotedescriptionfailed) when an outgoing PSTN call is rejected by the destination.
* Fixed: Issue where one-way audio was observed if an external bluetooth device was first connected and then disconnected whilst the Browser SDK was on an active call.
* Fixed: An issue where under unstable network conditions, Browser SDK keeps sending media metrics events even after a call has been hung up from the other end.
* Fixed: Issue where audio was getting picked up from both the external and internal microphones when the Bluetooth device was disconnected during a call and then added back during the next call.
* Fixed: Issue where audio output did not flow through an external Bluetooth device if one was added to a Windows machine.

## v2.2.2 (released@ 18-02-2021)
**Bug Fixes**

* Fixed: Missing Information in Call summary event when the browser is closed during an ongoing call.
* Fixed: Issue where, for the first call post initialization of the SDK, input audio was getting picked from the device microphone even if an external Bluetooth device was added before calling.

## v2.2.1 (released@ 01-02-2021)
**Features**

* Added: TypeScript support for Plivo Browser SDK
* Added: Network change improvements for Plivo Browser SDK
* Added: Improvements in events that were getting emitted during mute and unmute

## v2.1.36 (released@ 10-12-2020)
**Bug Fixes**
* Fixed: Issue where incoming calls were not ringing in desktop browsers as well when the tab with the call was in background. This is the expected behavior in mobile browsers but not desktop ones.
* Fixed: Issue where an ongoing browser call would face a one-way audio issue (remote user won't be able to hear the browser app user) if the bluetooth audio device being used by the browser app user got disconnected and switched to another audio input device.

## v2.1.35 (released@ 19-11-2020)
**Bug Fixes**
* Fixed: Issue where client name was being sent as 'Chrome' as part of Call Answered and Call Summary events even for calls made from Microsoft Edge browser. Now the value sent will be 'Edge'.
* Fixed: Issue where setting the configuration parameter 'dscp' as true was not behaving as intended and all UDP packets were still being set with DSCP Class CS0 (default class) instead of DSCP class EF (Expedited Forwarding) which is the expected behavior. Being set with EF ensures packets being tagged as high priority by network routers leading to lower chances of said packets being dropped and minimum per-hop delays.
* Fixed: Issue where, on receiving an incoming mobile browser call with the browser in background, the phone would start ringing despite a visual notification not possible (due to limitations imposed from browsers) and the customer having no way to find out which app is making the phone ring. Now the phone won't ring either.
* Fixed: Issue where a "TypeError" was being emitted if audio devices were toggled during an ongoing call. While this error did not affect any functionality, it was unnecessary and hence will not be emitted any more.


## v2.1.34 (released@ 19-10-2020)
**Bug Fixes**
 
* Fixed: Issue where onConnectionChange event was not getting triggered in the following scenarios: normal endpoint logout abrupt socket disconnection due to changed network conditions
 
**Features**
 
* Added: New flag to selectively enable local or remote call quality tracking for Browser SDK. The old flag, which could only toggle both of these together, is to be deprecated in the next major release
 
##v2.1.33 (released@ 17-09-2020)
**Bug Fixes**
 
* Fixed: Issue where incorrect audio level was getting printed if audio input device (mic) is switched from one input source to another (Eg: from bluetooth mic to internal mic) during an ongoing call.
* Fixed: Issue where one-way audio was being observed on calls made from Safari browser if audio input device (mic) is switched from one input source to another (Eg: from bluetooth mic to internal mic) during an ongoing call.
* Fixed: Issue where playback tone (incoming call ringtone) was getting played on device speakers if keyboard / headphones' 'play' button is pressed with the device in idle state.
 
**Features**
 
* Added: Buffer mechanism for temporarily storing Call Insights stats in the Browser before being sent to Plivo server in case of unstable network conditions.
 
##v2.1.32 (released@ 27-08-2020)
**Bug Fixes**
 
* Fixed: Issue where Call Summary and Call Answered events were not getting sent if the user adds "sip:" in their username
* Fixed: Issue related to device "set()" API not working as expected when called during idle state (no active calls)
 
**Features**
 
* Added: Basic Call-insights RTP stats support for Safari
* Added: Active Input Device Info as part of Call Answered and Call Summary events for Safari
 
## v2.1.31 (released@ 24-07-2020)
**Bug Fixes**
* Fixed: onMediaConnected event not emitting
 
## v2.1.30 (released@ 21-07-2020)
**Bug Fixes**
* Fixed: Unwanted warnings that were getting printed while loading Browser SDKs.
* Fixed: 'Mute' state from a call was being retained to the next call.
* Fixed: Error that was being generated while trying to play a ringtone in Safari
 
**Feature**
* Added: Improvements in the audio level calculation for Call-Insights
 
## v2.1.29 (released@ 21-05-2020)
**Fix**
* Fix for Heartbeat to stats-socket when the endpoint is logged out.
* Fix for Fractional loss during 'nan' which affecting the other stats
* Call-summary not getting sent when the browser is closed abruptly.
 
## v2.1.28 (released@ 14-05-2020)
**Fix**
* Fix for handling only anonymise local IPs(mDNS) during media negotiation
 
## v2.1.28 (released@ 13-05-2020)
**Fix**
* mDNS improvements
 
## v2.1.27 (released@ 28-04-2020)
**Fix**
* Rtpstats improvements in Firefox Browser
 
## v2.1.26 (released@ 23-03-2020)
**Fix**
* Removed callstats.io account
 
## v2.1.25 (released@ 31-03-2020)
**Fix**
* Fixed mute/unmute behaviour during audio device toggling for ongoing call.
* Fixed the issue where microphone was still being accessed in the idle state(no calls)
* "onVolume" fix : It is now supported for external audio devices that get connected during the call
 
## v2.1.24 (released@ 04-03-2020)
**Feature**
* Configurable maxAverageBitrate for OPUS codec
 
## v2.1.23 (released@ 18-02-2020)
**Fix**
* Fixed issue related to call summary event
 
## v2.1.22 (released@ 10-02-2020)
**Feature**
* Added Close protection flag for Browser
* Active device info to CallInsights
* Added Volume Indicator for Local and Remote audio
 
 
## v2.1.21 (released@ 30-01-2020)
**Feature**
* Automatic input device (mic) fallback to a working input device while on call.
 
**Fix**
* Ability to change input devices while on call.
* Updated extra header handling.
* Added SDK version in feedback stats.
 
## v2.1.20 (released@ 10-10-2019)
**Fix**
* Chrome's unified plan.
* Updates in MoS score calculation.
* RTP enabled flag in media metrics.
* Hangup issues in firefox and safari.
* Added stream for media metrics.
 
## v2.1.19 (released@ 29-08-2019)
**Fix**
* Calculate fraction loss for 0-5 seconds.
* Send setup options in call answered and summary stats.
* Reconnect media when there is a network change.
 
## v2.1.18 (released@ 07-08-2019)
**Fix**
* Disable RTP connection timeout flag fix.
 
## v2.1.17 (released@ 16-07-2019)
**Fix**
* Chromium os is identified and sent to call insights.
* Showing appropriate error message for https only support.
 
## v2.1.16 (released@ 13-05-2019)
**Feature**
* Added audio device info and media connection info to call insights.
 
## v2.1.15 (released@ 29-03-2019)
**Bug**
* Changed the log from error to info
 
## v2.1.14 (released@ 07-03-2019)
**Fix**
* Implemented onMediaConnected event when media connection established.
 
## v2.1.13 (released@ 28-02-2019)
**Fix**
* Handled get stats in latest firefox version.
 
## v2.1.12 (released@ 19-02-2019)
**Fix**
* Handled null values in stats calculation
* Added logs for callstats.io
 
## v2.1.11 (released@ 07-02-2019)
**Bug**
* Added log level hierarchy for the logger.
 
## v2.1.10 (released@ 04-02-2019)
**Bug**
* CallStats WebSocket was not connected due to callstats key not available when trying to connect
 
## v2.1.9 (released@ 01-02-2019)
**Fix**
* Removed username and password from request params
 
## v2.1.8 (released@ 16-01-2019)
**Fix**
* Made sendConsoleLogs parameter optional in submitCallQualityFeedback API
 
## v2.1.7 (released@ 16-01-2019)
**Bugs**
* Added callinsights support for Firefox version 60 and above and Chrome version 64 and above.
* New Feedback API for customers to report an issue and choose to allow us to collect call related logs.
* Fixed fraction loss calculation for local stream
* Updated mos score by taking minimum value of local and remote mos.
 
## v2.1.6 (released@ 02-01-2019)
**Bugs**
* Made plan-b default for upcoming chrome change in version 72.
 
## v2.1.5 (released@ 05-12-2018)
**Bugs**
* Fixed key names camel case
 
## v2.1.4 (released@ 04-12-2018)
**Feature**
* Extra meta data like browser's version and network informations for call insights.
 
## v2.1.3 (released@ 29-11-2018)
**Bugs**
* Fixed a scenario where ongoing call audio getting paused when incoming call is rejected in mutiple incoming call scenario
* Added validation for reject and ignore functions in multiple incoming calls
 
## v2.1.2 (released@ 23-11-2018)
**Bugs**
* Fixed a scenario where the calls were disconnection in chrome 54 due to the use of new webrtc APIs
 
## v2.1.1 (released@ 14-11-2018)
**Feature**
* An extra option "actionOnOtherIncomingCalls" is added for answer(callUUID, actionOnOtherIncomingCalls) function. During a mutiple incoming calls scenario, if "letring" is passed for actionOnOtherIncomingCalls, the call with callUUID passed to answer function will be answered and other calls will be ringing silently. If no values are passed for actionOnOtherIncomingCalls, the other incoming calls will be rejected.
 
## v2.1.0 (released@ 12-11-2018)
**BUG fix**
* microphoneDevices.set was setting deviceIds without removing the old deviceId, which is fixed.
* Added extra header to the callInfo object which is sent to some event callbacks
* Login with the endpoint which is currently logined in will not be allowed.
* Login with an different enpoint during an ongoing call will throw error saying "Cannot login when there is an ongoing call". [CSDK-87]
* Workaround for chrome [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=770694) where incoming call  ringtone file was not loading properly sometimes which leads to incoming call without ringtone [SUP-272].
* Removed media metrics' dependency with callstats.io and used our call insights data [CSDK-109].
* If the call uuid passed in the answer function deos not match any of the incoming calls, a error message will be logged and false will be returned.
* Workaround for firefox [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1495569) where 180's SDP during outbound call should have a=mid line.
 
**Feature**
* An extra option "actionOnOtherIncomingCalls" is added for answer(callUUID, actionOnOtherIncomingCalls) function. During a mutiple incoming calls scenario, if "ignore" is passed for actionOnOtherIncomingCalls, the call with callUUID passed to answer function will be answered and other calls will be ignored. If no values are passed for actionOnOtherIncomingCalls, the other incoming calls will be rejected.
* New option to allow multiple incoming calls.
* New method `ignore()` to take action on the incoming call.
* Call insights data are collected for the insights enabled accounts.
* Made project publishable to npmjs -> `npm install plivo-browser-sdk --save`
* getPeerConnection() will return RTCPeerConnection object even when the outbound call is in ringing state.
* Added support for '-' in extra headers keys.
 
## v2.0.24 (released@ 09-11-2018)
* Workaround for firefox [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1495569) where 180's SDP during outbound call should have a=mid line.
 
## v2.0.23 (released@ 20-09-2018)
* Workaround for chrome [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=770694) where incoming call ringtone file was not loading properly sometimes which leads to incoming call without ringtone.
 
## v2.0.22 (released@ 18-09-2018)
* Login with the endpoint which is currently logined in will not be allowed.
* Login with an different enpoint during an ongoing call will throw error saying "Cannot login when there is an ongoing call".
 
## v2.0.21 (released@ 23-08-2018)
* JsSIP v3.2.11 upgrade bug fixes
 
  1) reduced ice gathering timeout to 2 secs
 
  2) removed dependency with '\_is_confirmed' variable
* Callstats.io version upgraded to v3.53.1
* Switched off pre-call-test of callstats.io
* endpoint registration status fix
 
## v2.0.20 ( released@ 07-07-2018) [YANKED]
 
**BUG fix**
 
Fixed: Early Media playback on Firefox
 
**Added**
 
* Feature: WebSocket Connection change event listener . Detects abrupt websocket disconnection / connection / reconnection and notifies once per change.
* Upgrade Better logging for exception and unexpected behavior
* Optimize and upgrade npm dependencies such as Gulp and associated modules
* Upgrade underlying JSSIP library for ES6 , NOTIFY , REFER , INFO , RTCSessionDescription, Registrar
* Don't use pranswer for early media. Instead create an answer and do a workaround when the 200 arrives.
* Fix UA's disconnect event by properly providing an object with all the documente fields
* Add registrationExpiring event
* Don't send a Register request if another is on progress.
* RTCSession: process INFO in early state.
* Dialog: ACK to initial INVITE could have lower CSeq than current remote_cseq.
* WebSocketInterface: Add 'via_transport' setter.
* Use promise chaining to prevent PeerConnection state race conditions.
* New UA configuration parameter 'session_timers_refresh_method'.
* DigestAuthentication: fix 'auth-int' qop authentication
* RTCSession: emit 'sdp' event before creating offer/answer etc
* Unit test cases with linphonec
 
**deprecated**
 
 
##  v2.0.19
 
**BUG fix**
 
Optimize local storage values
 
**Added**
 
* Feature: WebSocket Connection change event listener . Detects abrupt websocket disconnection and notifies one time per 30 seconds .
* GDPR upgrade in Callstats
 
**deprecated**
 
 
##  v2.0.18
 
**BUG fix**
 
* Extra header length increased to 120, earlier it was 48
 
**Added**
 
* Add extra custom header
 
**deprecated**
 
## v2.0.9 ( released@ 05-10-2017)
 
**BUG fix**
 
* Fixed: Twilio webrtc API gets overridden by Plivo Sdk, Don’t alter URL.createObjectURL native code.
 
**Added**
 
* Feature: a config param `preDetectOwa` with `true/false` , Detect one way audio before answering/sending the call. Default value `false`
* Feature: `audioDeviceChange` event to listen for USB audio device changes. This event will emit an object with two properties `change` and `device`.
`change` - "added" or "removed"
`device` - device specific properties
* Collect Application logs in callstats dashboard under "logs" menu. Call summary log will get added to each callUUID.
* Callstats lib updated to 3.19.12, which gives callback based getStats once again in chrome 58
 
**deprecated**
 
 
## v2.0.8 ( released@ 04-13-2017)
 
**BUG fix**
 
**Added**
 
**deprecated**
 
* Removed: predetect OWA is taking 15sec in case of double natted system Refer: 894bcac0-1fc4-11e7-8451-8dbf96fbabce
 
## v2.0.7 ( released@ 04-12-2017)
 
**BUG fix**
 
* Packetloss was not emitted properly. values will be in decimals. Multiply by 100 to convert to %, Eg: packet loss of 2% will be emitted in value as 0.02
 
**Added**
* Feature added: `clientRegion` property in initialisation options to set and route calls to specific MediaServer POPs. Allowed regions are `["usa_west","usa_east","australia","europe","asia","south_america"]`.
* Feature added: Pre-detect One way audio. Before accepting Inbound call and before making an Outbound call. Make local peerConnection in loop and check for mic issues. This happens every first call on browser reload and then in 1 hr interval.
*  Feature added: Call Terminated by caller, Callee details. `onCallTerminated` event will have an object `{'originator':'local'}` if caller ends or `{'originator':'remote'}` if receiver ends
* Feature added:  `sendQualityFeedback()` will now allow custom comments with a cap of 200 characters max.
* Feature added: `debug:"ALL-PLAIN"` in Options to turn off colour mode
debug: "DEBUG" will show all logs except SIP trace
debug: "ALL" will show all logs including SIP trace , Colour  mode ON
debug: "ALL-PLAIN" will show all logs including SIP trace, Colour  mode OFF
 
**deprecated**
 
## v2.0.6 ( released@ 04-04-2017)
 
**BUG fix**
 
*  on logout() - use stop() instead of unregister(‘all’);
* URL.createObjectURL(stream) is deprecated! Use elem.srcObject = stream instead!
* reject () - only if call is not answered.
 
**Patch in JsSIP**
 
* @line:1538 patch included, The moment we get one Public IP from ICE just send out INVITE. File path sipLib/RTCSession.js
 
**Added**
 
* Feature added: Even if users don’t set enableTracking in options, we should set enableTracking=true
* Feature added: mediaMetrics Alert if ICE gathering takes more than 2 sec either for outgoing call invite or incoming call answer. Event name `ice_timeout`
*  Feature added: setConnectTone(true), Dial beep will play till we get 18X response from server. setting `false` will not play beep tone.
 
**deprecated**
 
## v2.0.5 ( released@ 02-27-2017)
 
**BUG fix**
 
* Terminate ICE gathering in 2 sec. After upgrading to JsSIP 3.0.0 this `gatheringTimeout` was removed.
 
**Patch in JsSIP**
 
* @line:1552 patch included to handle `gatheringTimeout` in sipLib/RTCSession.js; report to JsSIP https://github.com/versatica/JsSIP/issues/432
 
**Added**
 
* Included JsSIP lib as `sipLib` inside `plivo-websdk-2.0` to handle customization in Jssip library
 
**deprecated**
 
## v2.0.4
 
**BUG fix**
 
* Initialise JsSIP only after checking for DEBUG in log level to show proper SIP trace
 
**Added**
 
* Play remoteStream if Incoming 183 has SDP
* Added callUUID to both incoming and outgoing calls in logs. Makes easy to get callUUID directly from logs.
* Better clarity logs to both Incoming and Outgoing calls at each level
* Added log to show if Plivo sdk is initialised twice.
* Moved onIncomingCall event to emit on Incoming call progress. Previously its was emitted immediately after newRtcSession
* Now CallStats dashboard should Plivo websdk version in context, Under 'General' menu
* Microseconds is added to logger date
 
**deprecated**
 
## v2.0.3
 
**BUG fix**
 
* Emit `webrtcNotSupported` only on document ready.
* handle when callstats lib is not loaded 
 
**Added**
 
* moved all s3 links like audio and callstats lib to CDN links. cloudFront as Primary and CDN77 as secondary
* Don't initialise plivowebSDK when callstats lib is not loaded
 
**deprecated**
 
## v2.0.2
 
**BUG fix**
 
**Added**
 
* Audio API to control Input and Output devices
* availableDevices to show all all available audio devices
* revealAudioDevices to force allow permission and list available devices
* microphoneDevices to set and use particular microphone device as input
* speakerDevices to set and use particuarl speaker device for dtmf, remote audio
* ringtoneDevices to set and use particular speaker device for incoming ringtone
 
**deprecated**
 
## v2.0.1
 
**BUG fix**
 
**Added**
 
* we used webRTC adapter , a shim to insulate apps from spec changes and prefix differences which can work across most browsers
* supports Firefox, but mediaMetrics is not available since firefox doesn't supports it
* supports Opera ( not fully tested)
* added 2 new methods getLastCallUUID, webRTC and a variable version
* dscp param in options to support QoS
* websocket min try to 2 and max retry to 20 in case client disconnects from socket server
* reduced stun servers to 2 to reduce the size of SDP and to reduce stun gathering time
* mediaMetrics supported in chrome and opera a major feature to trigger warning events during bad network and audio conditions
* upgraded Plivo websdk to latest jsSIP 3.0.0
 
**deprecated**
 

