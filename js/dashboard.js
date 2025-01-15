import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    // 현재 로그인한 사용자 확인
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // 폼 초기화 함수를 먼저 정의
        function resetCaseForm() {
            document.getElementById('caseId').value = '';
            document.getElementById('clinicName').value = '';
            document.getElementById('patientName').value = '';
            document.getElementById('shadeGuideModel').value = '';
            document.getElementById('memo').value = '';
            document.getElementById('createdAt').value = '';
        }

        const caseContainer = document.querySelector('.case-table-content');
        
        // 테이블 컨테이너에 이벤트 위임 설정
        caseContainer.addEventListener('click', async function(e) {
            // 삭제 버튼 클릭 처리
            if (e.target.classList.contains('delete')) {
                if (confirm('정말로 이 케이스를 삭제하시겠습니까?')) {
                    const caseRow = e.target.closest('.case-table-row');
                    const caseId = caseRow.dataset.caseId;
                    
                    try {
                        await deleteDoc(doc(db, 'cases', caseId));
                        await loadCases();
                        alert('케이스가 성공적으로 삭제되었습니다.');
                    } catch (error) {
                        console.error("케이스 삭제 실패:", error);
                        alert('케이스 삭제에 실패했습니다.');
                    }
                }
            }
            
            // 실행하기 버튼 클릭 처리
            if (e.target.classList.contains('play') && !e.target.classList.contains('delete')) {
                const caseInfo = JSON.parse(e.target.dataset.caseInfo);
                const params = new URLSearchParams(caseInfo).toString();
                window.location.href = `main.html?${params}`;
            }
        });

        async function loadCases() {
            try {
                const q = query(
                    collection(db, 'cases'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                
                const querySnapshot = await getDocs(q);
                caseContainer.innerHTML = ''; // 기존 내용 비우기
                
                if (querySnapshot.empty) {
                    caseContainer.innerHTML = `
                        <div class="case-table-row">
                            <div class="text-center w-100 pd-32px">
                                <div class="text-50 color-neutral-500">등록된 케이스가 없습니다.</div>
                            </div>
                        </div>
                    `;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const caseData = doc.data();
                    const caseHtml = `
                        <div class="case-table-row case" data-case-id="${doc.id}">
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36cb-ca543eaa" class="div-block-4">
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36cc-ca543eaa" class="paragraph-small color-neutral-100 mg-bottom-2px">${caseData.caseId}</div>
                        </div>
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36cf-ca543eaa">
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d0-ca543eaa" class="paragraph-small color-neutral-100 mg-bottom-2px">${caseData.clinicName}</div>
                        </div>
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d2-ca543eaa">
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d3-ca543eaa" class="paragraph-small color-neutral-100 mg-bottom-2px">${caseData.patientName}</div>
                        </div>
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d5-ca543eaa">
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d6-ca543eaa" class="paragraph-small color-neutral-100 mg-bottom-2px">${new Date(caseData.createdAt.toDate()).toLocaleDateString()}</div>
                        </div>
                        <div id="w-node-fdef1c8d-b269-40f9-d191-504331ba36d8-ca543eaa" class="div-block-2">
                        <div class="div-block">
                            <div class="status-badge green">
                            <div class="flex align-center gap-column-4px">
                                <div class="paragraph-small">케이스 생성</div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div id="w-node-f306c9ec-5450-be5f-96ec-3019782cc848-ca543eaa" class="div-block-5">
                        <div id="w-node-f306c9ec-5450-be5f-96ec-3019782cc849-ca543eaa" class="paragraph-small play" data-case-info='${JSON.stringify({
                            uid: user.uid,
                            caseId: caseData.caseId,
                            clinicName: caseData.clinicName,
                            patientName: caseData.patientName,
                            createdAt: caseData.createdAt.toDate().toISOString(),
                            memo: caseData.memo
                        })}'>실행하기</div>
                        </div>
                        <div id="w-node-_229ffc2d-55df-4a28-1cae-a8783c2bf690-ca543eaa" class="div-block-5 delete">
                        <div id="w-node-_229ffc2d-55df-4a28-1cae-a8783c2bf691-ca543eaa" class="paragraph-small play delete">삭제</div>
                        </div>
                    </div>
                    `;
                    caseContainer.insertAdjacentHTML('beforeend', caseHtml);
                });
            } catch (error) {
                console.error("케이스 목록 로딩 실패:", error);
            }
        }

        // 초기 케이스 목록 로드
        await loadCases();

        // 케이스 생성 폼 제출 처리
        const submitBtn = document.getElementById('caseSubmitBtn');
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // 폼 데이터 가져오기
                const caseId = document.getElementById('caseId').value;
                const clinicName = document.getElementById('clinicName').value;
                const patientName = document.getElementById('patientName').value;
                const shadeGuideModel = document.getElementById('shadeGuideModel').value;
                const memo = document.getElementById('memo').value;

                // 유효성 검사
                if (!caseId || !clinicName || !patientName) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                // Firestore에 케이스 추가
                await addDoc(collection(db, 'cases'), {
                    caseId: caseId,
                    userId: user.uid,
                    clinicName: clinicName,
                    patientName: patientName,
                    createdAt: serverTimestamp(),
                    status: '케이스 생성',
                    shadeGuideModel: shadeGuideModel,
                    memo: memo
                });

                // 모달 닫기
                document.querySelector('.modalwrapper').style.display = 'none';
                
                // 폼 초기화
                resetCaseForm();
                
                // 케이스 목록 새로고침
                await loadCases();

                alert('케이스가 성공적으로 등록되었습니다.');

            } catch (error) {
                console.error("케이스 생성 실패:", error);
                alert('케이스 생성에 실패했습니다.');
            }
        });

        // 모달 닫기 버튼 클릭 시 폼 초기화
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        modalCloseBtn.addEventListener('click', function() {
            resetCaseForm();
            document.querySelector('.modalwrapper').style.display = 'none';
        });

        // 모달 외부 클릭 시 폼 초기화
        const modalWrapper = document.querySelector('.modalwrapper');
        modalWrapper.addEventListener('click', function(e) {
            if (e.target === modalWrapper) {
                resetCaseForm();
                modalWrapper.style.display = 'none';
            }
        });
    });
});