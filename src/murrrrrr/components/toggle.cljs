(ns murrrrrr.components.toggle)

(defn toggle [toggle-fn]
  [:input {:type "checkbox"
           :class "colorscheme-toggle"
           :on-change #(toggle-fn (.. % -target -checked))}])
