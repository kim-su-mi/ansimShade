import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    // 현재 로그인한 사용자 확인
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // 케이스 목록을 표시할 컨테이너
        const caseContainer = document.querySelector('.case-table-content');
        
        // 케이스 목록 가져오기 함수
        async function loadCases() {
            try {
                const q = query(
                    collection(db, 'cases'),
                    where('userId', '==', user.uid)
                );
                
                const querySnapshot = await getDocs(q);
                caseContainer.innerHTML = ''; // 기존 내용 비우기
                if (querySnapshot.empty) {
                    caseContainer.innerHTML += `
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
                        <div class="case-table-row case">
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
                        <div id="w-node-f306c9ec-5450-be5f-96ec-3019782cc849-ca543eaa" class="paragraph-small play">실행하기</div>
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

        // 페이지 로드시 케이스 목록 가져오기
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
                
                // 케이스 목록 새로고침
                await loadCases();


                alert('케이스가 성공적으로 등록되었습니다.');

            } catch (error) {
                console.error("케이스 생성 실패:", error);
                alert('케이스 생성에 실패했습니다.');
            }
        });
    });
});