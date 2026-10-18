const home = document.querySelector("#home");
const reader = document.querySelector("#reader");
const list = document.querySelector("#essay-list");
const search = document.querySelector("#search");
const topicLinks = [...document.querySelectorAll("[data-topic]")];
let articles = [];

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(value));
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderList() {
  const params = new URLSearchParams(location.search);
  const topic = params.get("topic") || "all";
  const query = (params.get("q") || "").trim().toLowerCase();
  search.value = params.get("q") || "";
  for (const link of topicLinks) {
    link.removeAttribute("aria-current");
    if (link.dataset.topic === topic) link.setAttribute("aria-current", "true");
    const target = new URL(location.href);
    target.searchParams.delete("essay");
    target.searchParams.delete("topic");
    if (link.dataset.topic !== "all") target.searchParams.set("topic", link.dataset.topic);
    target.hash = "essays";
    link.href = target.href;
  }
  const selected = articles.filter((article) => {
    if (topic !== "all" && !article.tags.includes(topic)) return false;
    return `${article.title} ${article.description} ${article.tags.join(" ")}`.toLowerCase().includes(query);
  });
  list.replaceChildren();
  for (const article of selected) {
    const item = element("li", "");
    const link = element("a", "essay-row");
    const target = new URL(location.href);
    target.searchParams.set("essay", article.slug);
    target.hash = "";
    link.href = target.href;
    const index = articles.indexOf(article) + 1;
    const number = element("p", "essay-number mono", String(index).padStart(2, "0"));
    number.setAttribute("aria-hidden", "true");
    const copy = element("div", "essay-copy");
    copy.append(element("h3", "essay-title", article.title), element("p", "essay-description", article.description));
    const meta = element("p", "essay-meta mono");
    meta.append(document.createTextNode(dateLabel(article.published)), document.createElement("br"), document.createTextNode(` · ${article.readingTime}`));
    const arrow = element("span", "essay-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.append(number, copy, meta, arrow);
    item.append(link);
    list.append(item);
  }
  document.querySelector("#empty-state").hidden = selected.length !== 0;
  document.querySelector("#result-status").textContent = `${selected.length} essays shown`;
}

function renderReader(article) {
  document.title = `${article.title} — Still Brook`;
  document.querySelector("#reader-title").textContent = article.title;
  document.querySelector("#reader-topic").textContent = article.tags.join(" / ");
  document.querySelector("#reader-meta").textContent = `${article.author} · ${dateLabel(article.published)} · ${article.readingTime}`;
  document.querySelector("#original-link").href = `https://stillbrook.dev/articles/${article.slug}`;
  const back = new URL(location.href);
  back.searchParams.delete("essay");
  back.hash = "essays";
  document.querySelector("#back-to-notebook").href = back.href;
  const body = document.querySelector("#reader-body");
  body.replaceChildren();
  article.paragraphs.forEach((paragraph, index) => {
    body.append(element("p", "", paragraph));
    if (index === 0 && article.openingCode) {
      const pre = element("pre", "");
      pre.append(element("code", "", article.openingCode));
      body.append(pre);
    }
  });
  if (article.slug === "the-cabinet-of-impossible-machines") {
    const figure = element("figure", "");
    const image = element("img", "");
    image.src = "assets/cabinet.webp";
    image.alt = article.image.alt;
    image.width = 1920;
    image.height = 1421;
    const caption = element("figcaption", "mono");
    const source = element("a", "", "Cabinet of Curiosities — Domenico Remps · Public domain");
    source.href = article.image.credit.href;
    caption.append(source);
    figure.append(image, caption);
    body.append(figure);
  }
}

function render() {
  const slug = new URLSearchParams(location.search).get("essay");
  const article = articles.find((item) => item.slug === slug);
  home.hidden = Boolean(article);
  reader.hidden = !article;
  if (article) {
    renderReader(article);
    return;
  }
  document.title = "Still Brook — A field journal";
  renderList();
}

function navigate(url) {
  const wasReading = !reader.hidden;
  history.pushState(null, "", url);
  render();
  document.querySelector(".mobile-menu").open = false;
  if (!reader.hidden) {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector("#reader-title").focus({ preventScroll: true });
  } else if (url.hash) {
    document.querySelector(url.hash)?.scrollIntoView();
    if (wasReading) document.querySelector("#notebook-title").focus({ preventScroll: true });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname) return;
  if (link.id === "clear-filters") url.search = "";
  event.preventDefault();
  navigate(url);
});

function updateSearch(push) {
  const url = new URL(location.href);
  url.searchParams.delete("q");
  if (search.value) url.searchParams.set("q", search.value);
  url.hash = "essays";
  if (push) history.pushState(null, "", url);
  else history.replaceState(null, "", url);
  renderList();
}

search.addEventListener("input", () => updateSearch(false));
document.querySelector(".search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateSearch(true);
});
window.addEventListener("popstate", render);
document.querySelector("#notebook-title").tabIndex = -1;

function start() {
  try {
    articles = JSON.parse(document.querySelector("#essay-data").textContent);
    articles.sort((a, b) => new Date(b.published) - new Date(a.published));
    render();
  } catch (error) {
    document.querySelector("#result-status").textContent = "The essay index could not be loaded.";
    const message = element("li", "empty-state", "The notebook could not be opened. Try refreshing the page.");
    list.replaceChildren(message);
    console.error(error);
  }
}
start();
