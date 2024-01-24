(ns murrrrrr.utils
  (:require [react]))

(defn update-css! [el key val]
  (.. el -style (setProperty (name key) val)))

(defn sleep [f ms]
  (.setTimeout js/window f ms))

(set! *warn-on-infer* false)

(defn augment-self-on-mount [component fn-in]
  (with-meta component
    {:component-did-mount (fn [^react/JSXElement this]
                            (let [c (.. this -refs -container)]
                              (fn-in c)))}))
