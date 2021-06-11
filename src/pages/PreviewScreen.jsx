import React, { useContext } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { Preview } from "@100mslive/hms-video-react";
import { AppContext } from "../store/AppContext";
import getToken from "../services/tokenService";

const PreviewScreen = ({ getUserToken }) => {
  const history = useHistory();
  const context = useContext(AppContext);
  const { loginInfo, setLoginInfo, setMaxTileCount, tokenEndpoint } = context;
  const { roomId: urlRoomId, role: userRole } = useParams();
  const location = useLocation();

  const join = ({ audioMuted, videoMuted, name }) => {
    if (!userRole) {
      getUserToken(name).then((token) => {
        setLoginInfo({
          token,
          audioMuted,
          videoMuted,
          roomId: urlRoomId,
          username: name,
        });
        if (userRole) history.push(`/meeting/${urlRoomId}/${userRole}`);
        else history.push(`/meeting/${urlRoomId}`);
      })
        .catch(error => {
          console.log("Token API Error", error);
        });
    }
    else {
      getToken(tokenEndpoint, loginInfo.env, name, userRole, urlRoomId)
        .then(token => {
          setLoginInfo({
            token,
            audioMuted,
            videoMuted,
            role: userRole,
            roomId: urlRoomId,
            username: name,
          });
          // send to meeting room now
          if (userRole) history.push(`/meeting/${urlRoomId}/${userRole}`);
          else history.push(`/meeting/${urlRoomId}`);
        })
        .catch(error => {
          console.log("Token API Error", error);
        });
    }
  };

  const onChange = ({
    selectedVideoInput,
    selectedAudioInput,
    selectedAudioOutput,
    maxTileCount,
  }) => {
    console.debug("app: Selected Video Input", selectedVideoInput);
    console.debug("app: Selected Audio Input", selectedVideoInput);
    console.debug("app: Selected Audio Output", selectedAudioOutput);
    setLoginInfo({
      selectedVideoInput,
      selectedAudioInput,
      selectedAudioOutput,
    });
    setMaxTileCount(maxTileCount);
  };

  const goBack = () => {
    window.location.reload();
  };

  const isPreview = location.pathname.startsWith("/preview");

  if (userRole) {
    if (
      (isPreview && urlRoomId === "preview") || // '/<preview|meeting|leave>'
      urlRoomId === "meeting" ||
      urlRoomId === "leave"
    ) {
      history.push(`/`);
    } else if (!isPreview) {
      history.push(`/preview/${urlRoomId}/${userRole}`);
    }
    else {
      return (
        <div className="h-full">
          <div className="flex justify-center h-full items-center">
            <Preview
              joinOnClick={join}
              goBackOnClick={goBack}
              messageOnClose={goBack}
              onChange={onChange}
            />
          </div>
        </div>
      );
    }
  }
  else {
    if (urlRoomId === "preview" || // '/<preview|meeting|leave>'
      urlRoomId === "meeting" ||
      urlRoomId === "leave"
    ) {
      history.push(`/`);
    }
    else if (!isPreview) {
      history.push(`/preview/${urlRoomId}`);
    }
    else {
      return (
        <div className="h-full">
          <div className="flex justify-center h-full items-center">
            <Preview
              joinOnClick={join}
              goBackOnClick={goBack}
              messageOnClose={goBack}
              onChange={onChange}
            />
          </div>
        </div>
      );
    }
  }

  return null;
};

export default PreviewScreen;
