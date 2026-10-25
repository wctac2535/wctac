(function(){
  var C=window.WCTAC, KEY='wctac_session', W=window.W={};
  W.ROLE={owner:'เจ้าของระบบ',librarian:'ผู้ดูแลห้องสมุด',teacher:'ครูประจำชั้น',assistant:'ครูผู้ช่วย',viewer:'ผู้ชม'};
  W.token=function(){try{return localStorage.getItem(KEY)}catch(e){return null}};
  W.setToken=function(t){try{t?localStorage.setItem(KEY,t):localStorage.removeItem(KEY)}catch(e){}};
  W.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  W.raw=function(fn,args){
    return fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({fn:fn,args:args||[]})})
      .then(function(r){return r.json()}).then(function(j){if(!j.ok)throw new Error(j.error);return j.result});
  };
  // เรียกฟังก์ชันที่ต้องล็อกอิน: ใส่ token ให้เอง; ถ้าหมดอายุให้กลับหน้าแรก
  W.api=function(fn,args){
    return W.raw(fn,[W.token()].concat(args||[])).catch(function(e){
      if(/เข้าสู่ระบบ/.test(e.message)){W.setToken(null);location.href='index.html'}
      throw e;
    });
  };
  // รายการเลือกชั้นแบบจัดกลุ่มตามแผนก (classes ต้องเรียงตามแผนกแล้ว)
  W.clsOptions=function(list){
    var out='',cur=null;
    list.forEach(function(c){
      if(c.deptName!==cur){if(cur!==null)out+='</optgroup>';out+='<optgroup label="แผนก'+W.esc(c.deptName)+'">';cur=c.deptName}
      out+='<option value="'+c.classId+'">'+W.esc(c.name)+'</option>';
    });
    return out+(cur!==null?'</optgroup>':'');
  };
  W.band=function(){
    var t=document.body.getAttribute('data-title');if(!t)return;
    var b=document.createElement('div');b.className='band noprint';
    b.innerHTML='<img src="img/logo.png" alt="" width="38" height="38"><div><div class="t1">'+W.esc(t)+'</div><div class="t2">ระบบสารสนเทศสำนักศาสนศึกษาวัดพระธาตุศรีจอมทอง</div></div>';
    document.body.insertBefore(b,document.body.firstChild);
    var h=document.querySelector('main .bar h1');if(h)h.parentNode.removeChild(h);
  };
  W.band();
  W.need=function(cb){
    if(!W.token()){location.href='index.html';return}
    W.raw('me',[W.token()]).then(function(u){W.user=u;cb(u)},function(){W.setToken(null);location.href='index.html'});
  };
  W.logout=function(){var t=W.token();W.setToken(null);(t?W.raw('logout',[t]):Promise.resolve()).then(function(){location.href='index.html'},function(){location.href='index.html'})};
})();
