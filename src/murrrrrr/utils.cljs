(ns murrrrrr.utils)

(defn update-css! [el key val]
  (.. el -style (setProperty (name key) val)))

(defn sleep [f ms]
  (.setTimeout js/window f ms))

