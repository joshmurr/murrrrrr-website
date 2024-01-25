(ns murrrrrr.components.obstacle-text
  (:require
   [dv.cljs-emotion-reagent :refer [jsx]]))

(defn obstacle-text [dims text]
  (let [{:keys [top left width height border]} dims]
    (jsx :div {:className "obstacle"
               :css {:position "absolute"
                     :overflow "hidden"
                     :color "white"
                     :top (or top 0)
                     :left (or left 0)
                     :width (or width "100%")
                     :height (or height "100%")
                     :font-size "1.5em"
                     :font-family "monospace"
                     :border (if (nil? border) "none" "1px dashed white")
                     :font-weight "bold"}}
         [:p text])))



