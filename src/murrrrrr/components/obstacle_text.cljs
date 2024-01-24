(ns murrrrrr.components.obstacle-text
  (:require [cljss.reagent :refer-macros [defstyled]]))

(declare obstacle-text)

(defstyled obstacle-text :div
  {:position "absolute"
   :top (with-meta #(str % "px") :top)
   :left (with-meta #(str % "px") :left)
   :width (with-meta #(str % "px") :width)
   :height (with-meta #(str % "px") :height)
   :overflow "hidden"
   :color "white"
   :border "1px solid white"
   :font-size "1.5em"
   :font-family "monospace"
   :font-weight "bold"
   :text-shadow "0 0 10px white"})
