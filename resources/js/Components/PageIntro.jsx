export default function PageIntro({ eyebrow = 'Workspace', title, description }) {
    return (
        <header className="page-intro">
            <p className="ui-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p className="page-intro-description">{description}</p>}
        </header>
    );
}
