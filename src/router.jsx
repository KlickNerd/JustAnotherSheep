export function routeTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function SiteLink({ href, children, className = '', onClick }) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); onClick?.(); routeTo(href); }}>{children}</a>;
}
