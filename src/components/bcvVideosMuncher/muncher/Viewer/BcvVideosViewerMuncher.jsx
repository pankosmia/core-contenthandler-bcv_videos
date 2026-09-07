import { useEffect, useState, useContext, useRef } from "react";
import { Box, Stack } from "@mui/material";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import {
  i18nContext as I18nContext,
  debugContext as DebugContext,
  bcvContext as BcvContext,
} from "pankosmia-rcl";
import { getText } from "pankosmia-lib/http";
import TextDir from "../helpers/TextDir";

function VideoViewer({ metadata, reference }) {
  return (
    <Stack>
      <img
        src={`/api/burrito/ingredient/bytes/${metadata.local_path}?ipath=${reference.slice(2)}.jpg`}
        alt="resource image"
      />
    </Stack>
  );
}
function BcvImagesViewerMuncher({ metadata }) {
  const [ingredient, setIngredient] = useState([]);
  const [verseNotes, setVerseNotes] = useState([]);
  const [textDir, setTextDir] = useState(
    metadata?.script_direction
      ? metadata.script_direction.toLowerCase()
      : undefined,
  );

  const { systemBcv } = useContext(BcvContext);
  const { debugRef } = useContext(DebugContext);
  const { i18nRef } = useContext(I18nContext);

  const sbScriptDir = metadata?.script_direction
    ? metadata.script_direction.toLowerCase()
    : undefined;
  const sbScriptDirSet = sbScriptDir === "ltr" || sbScriptDir === "rtl";

  let [current, setCurrent] = useState(0);
  const videoRefs = useRef([]);

  let previousSlide = () => {
    // Pause current video before changing slide
    if (videoRefs.current[current]) {
      try {
        videoRefs.current[current].pause();
        videoRefs.current[current].currentTime = 0;
      } catch (e) {}
    }
    if (current === 0) setCurrent(verseNotes.length - 1);
    else setCurrent(current - 1);
  };

  let nextSlide = () => {
    // Pause current video before changing slide
    if (videoRefs.current[current]) {
      try {
        videoRefs.current[current].pause();
        videoRefs.current[current].currentTime = 0;
      } catch (e) {}
    }
    if (current === verseNotes.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  const getAllData = async () => {
    const ingredientLink = `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
    let response = await getText(ingredientLink, debugRef.current);
    if (response.ok) {
      setIngredient(
        response.text
          .split("\n")
          .map((l) => l.split("\t").map((f) => f.replace(/\\n/g, "\n\n"))),
      );
    }
  };

  useEffect(
    () => {
      getAllData().then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [systemBcv],
  );

  useEffect(() => {
    const doVerseNotes = async () => {
      let ret = [];
      const start = systemBcv.verseNum;
      const end = systemBcv.endVerseNum || systemBcv.verseNum;
      for (const row of ingredient.filter((l) => {
        const [chapter, verse] = l[0].split(":").map(Number);
        return (
          chapter === systemBcv.chapterNum && verse >= start && verse <= end
        );
      })) {
        ret.push(row[6]);
      }
      setVerseNotes(ret);
      // Reset current index when verseNotes changes
      setCurrent(0);
      // Reset video refs
      videoRefs.current = [];
    };
    doVerseNotes().then();
  }, [
    ingredient,
    metadata?.local_path,
    systemBcv.bookCode,
    systemBcv.chapterNum,
    systemBcv.verseNum,
    systemBcv.endVerseNum,
  ]);

  const [verseCaptions, setVerseCaptions] = useState([]);

  useEffect(
    () => {
      // Clear captions when verse notes change to avoid stale text
      setVerseCaptions([]);
      if (verseNotes.length > 0) {
        const doVerseCaptions = async () => {
          let captions = [];
          for (const v of verseNotes) {
            let response = await getText(
              `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${v.slice(2)}.txt`,
              debugRef.current,
            );
            if (response.ok) {
              captions = [...captions, response.text];
            } else {
              return "";
            }
          }
          setVerseCaptions(captions);
          if (!sbScriptDirSet) {
            const dir = await TextDir(captions.toString(), "text");
            setTextDir(dir);
          }
        };
        doVerseCaptions().then();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [verseNotes],
  );

  // Pause any playing videos before resource/verse changes and ensure cleanup
  useEffect(() => {
    return () => {
      for (const vid of videoRefs.current) {
        if (vid) {
          try {
            vid.pause();
            vid.currentTime = 0;
          } catch (e) {}
        }
      }
    };
  }, [
    metadata?.local_path,
    systemBcv.bookCode,
    systemBcv.chapterNum,
    systemBcv.verseNum,
  ]);

  const get = async () => {
    const ingredientLink = `/api/burrito/ingredient/raw/${metadata.local_path}?ipath=${systemBcv.bookCode}.tsv`;
    let response = await getText(ingredientLink, debugRef.current);
    if (response.ok) {
      setIngredient(
        response.text
          .split("\n")
          .map((l) => l.split("\t").map((f) => f.replace(/\\n/g, "\n\n"))),
      );
    }
  };

  // If SB does not specify direction then it is set here, otherwise it has already been set per SB in WorkspaceCard
  return (
    <Box
      className="h-full w-full flex flex-col overflow-hidden"
      dir={!sbScriptDirSet ? textDir : undefined}
    >
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden p-2">
        {ingredient && verseNotes.length > 0 ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Slider area */}
            <div className="relative flex-1 min-h-0 min-w-0">
              <div
                className="flex transition-transform duration-300 ease-out h-full"
                style={{
                  transform: `translateX(-${current * (100 / verseNotes.length)}%)`,
                  width: `${verseNotes.length * 100}%`,
                }}
              >
                {verseNotes.map((v, n) => (
                  <div
                    key={`${metadata.local_path}-${v}`}
                    className="w-full h-full flex-shrink-0 flex items-center justify-center"
                    style={{ width: `${100 / verseNotes.length}%` }}
                  >
                    <video
                      ref={(el) => (videoRefs.current[n] = el)}
                      controls
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    >
                      <source
                        src={`/api/burrito/ingredient/bytes/${metadata.local_path}?ipath=${v.slice(2)}.mp4`}
                        type="video/mp4"
                      />
                      {"video"}
                    </video>
                  </div>
                ))}
              </div>

              {/* Navigation buttons for the slider */}
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                <button
                  className="cursor-pointer pointer-events-auto bg-blue-300 hover:bg-blue-400 rounded-full p-1 text-white"
                  onClick={previousSlide}
                >
                  <ArrowCircleLeftIcon />
                </button>
                <button
                  className="cursor-pointer pointer-events-auto bg-blue-300 hover:bg-blue-400 rounded-full p-1 text-white"
                  onClick={nextSlide}
                >
                  <ArrowCircleRightIcon />
                </button>
              </div>

              {/* Circle buttons bottom of the image */}
              <div className="absolute left-0 right-0 bottom-8 md:bottom-12 flex items-center justify-center pointer-events-none">
                <div className="flex justify-center gap-2 pointer-events-none">
                  {verseNotes.map((v, n) => {
                    return (
                      <div
                        onClick={() => {
                          if (videoRefs.current[current]) {
                            try {
                              videoRefs.current[current].pause();
                              videoRefs.current[current].currentTime = 0;
                            } catch (e) {}
                          }
                          setCurrent(n);
                        }}
                        key={`circle-${metadata.local_path}-${v}`}
                        className={`rounded-full w-3 h-3 cursor-pointer pointer-events-auto hover:bg-opacity-80 border border-gray-300/30 shadow-sm ${
                          n == current ? "bg-blue-300" : "bg-gray-700"
                        }`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Caption below the slider, outside of the video area */}
            <div className="text-center py-3 px-4 text-base font-medium text-gray-800 bg-white/80 shadow-inner">
              {`${verseCaptions[current]} (${current + 1} of ${verseNotes.length})`}
            </div>
          </div>
        ) : (
          doI18n(
            "munchers:bcv_images_viewer:no_images_found",
            i18nRef.current,
          ) +
          ` (${systemBcv.bookCode} ${systemBcv.chapterNum}:${systemBcv.verseNum}${systemBcv.endVerseNum && systemBcv.endVerseNum !== systemBcv.verseNum ? `-${systemBcv.endVerseNum}` : ""}}`
        )}
      </div>
    </Box>
  );
}

export default BcvImagesViewerMuncher;
