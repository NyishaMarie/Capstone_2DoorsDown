// shared error message, so every form and page shows problems the same way

export default function Errors({ message }) {

  // nothing went wrong, so render nothing at all
    if (!message) return null;

  // role="alert" tells screen readers to announce this the moment it appears
    return <p role="alert">{message}</p>;
}