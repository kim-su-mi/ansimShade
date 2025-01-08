document.addEventListener('DOMContentLoaded', function() {
    const signupBtn = document.getElementById('signupBtn');
    const signupSection = document.querySelector('.signup-section');
    const closeBtn = document.querySelector('.closebtn');
    
    // 초기에는 회원가입 섹션을 숨김
    signupSection.style.display = 'none';
    
    // 회원가입 버튼 클릭 시 회원가입 섹션 표시
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupSection.style.display = 'block';
    });
    
    // 닫기 버튼 클릭 시 회원가입 섹션 숨김
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupSection.style.display = 'none';
    });

    
});