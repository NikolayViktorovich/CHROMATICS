import { PHONES } from '../lib/contacts'

const linkClass = 'text-stone-800 underline-offset-2 hover:underline'

export function PhoneLinks({ separator = ', ' }: { separator?: string }) {
  return (
    <>
      {PHONES.map((phone, index) => (
        <span key={phone.href}>
          {index > 0 ? separator : null}
          <a href={phone.href} className={linkClass}>
            {phone.display}
          </a>
        </span>
      ))}
    </>
  )
}

export function PhoneList() {
  return (
    <>
      <br />
      Тел.:{' '}
      <a href={PHONES[0].href} className={linkClass}>
        {PHONES[0].display}
      </a>
      {PHONES.slice(1).map((phone) => (
        <span key={phone.href}>
          <br />
          <a href={phone.href} className={linkClass}>
            {phone.display}
          </a>
        </span>
      ))}
    </>
  )
}
