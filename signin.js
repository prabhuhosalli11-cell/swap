// Minimal interactions for signin page: show/hide password, simple validation, entrance animation
document.addEventListener('DOMContentLoaded', function(){
  const card = document.querySelector('.auth-card');
  if(card) requestAnimationFrame(()=>card.classList.add('is-visible'));

  const pwd = document.getElementById('password');
  if(pwd){
    const wrap = document.createElement('div'); wrap.className='password-wrap';
    pwd.parentNode.replaceChild(wrap,pwd);
    wrap.appendChild(pwd);

    const btn = document.createElement('button');
    btn.type='button';btn.className='password-toggle';btn.setAttribute('aria-label','Show password');btn.innerText='Show';
    wrap.appendChild(btn);

    btn.addEventListener('click', ()=>{
      if(pwd.type==='password'){pwd.type='text';btn.innerText='Hide';btn.setAttribute('aria-label','Hide password');}
      else {pwd.type='password';btn.innerText='Show';btn.setAttribute('aria-label','Show password');}
    });
  }

  // simple client-side validation with aria-live
  const form = document.getElementById('signinForm');
  if(form){
    const live = document.createElement('div');live.setAttribute('aria-live','polite');live.className='sr-only';form.appendChild(live);
    form.addEventListener('submit', function(e){
      const email = form.querySelector('input[type="email"]');
      const password = form.querySelector('input[type="password"]');
      let valid = true; let msg = '';
      if(!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)){ valid=false; email.classList.add('input-error'); msg='Please enter a valid email address.' } else email.classList.remove('input-error');
      if(!password.value || password.value.length < 6){ valid=false; password.classList.add('input-error'); msg = msg ? msg + ' Password must be at least 6 characters.' : 'Password must be at least 6 characters.' } else password.classList.remove('input-error');
      if(!valid){ e.preventDefault(); live.textContent = msg; // announce
        // show inline message if not present
        let err = form.querySelector('.error-msg');
        if(!err){ err = document.createElement('div'); err.className='error-msg'; form.insertBefore(err, form.firstChild); }
        err.textContent = msg;
        // focus first invalid
        const firstInvalid = form.querySelector('.input-error'); if(firstInvalid) firstInvalid.focus();
      }
    });
  }
});
