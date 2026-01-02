
import React, { useState, useCallback, useEffect } from 'react';
import Terminal from './components/Terminal';
import Room from './components/Room';
import { GameState, LogEntry, Difficulty, LevelConfig } from './types';
import { generateSystemResponse } from './services/geminiService';
import { audioService } from './services/audioService';

const generateLevels = (): LevelConfig[] => {
  const r = () => Math.floor(Math.random() * 10);
  
  // Level 1: Storage
  const c1 = [r(), r(), r()];
  const l1: LevelConfig = {
    id: 1,
    name: "지하 창고",
    code: c1.join(''),
    description: `어둡고 습한 지하 창고. 디지털 이끼(Moss)가 벽을 덮고 있고, 글리치(Glitch)가 일어나는 구석이 있다. 정답 코드는 ${c1.join('')}이다.`,
    introMessage: "여긴... 시스템의 가장 밑바닥 창고야. 방 안에 숨겨진 3개의 숫자를 모두 찾아야 나갈 수 있어. 물건들을 클릭해봐.",
    itemInteractions: {
      'lv1_trap': { message: "!!! 경고: 불안정한 바닥 패널입니다.", sound: 'alarm', isTrap: true },
      'lv1_moss': { 
        message: "습한 이끼 아래에 무언가 숨겨져 있습니다.", 
        sound: 'beep', 
        quiz: {
          question: "이 식물은 그늘지고 습한 곳을 좋아합니다. 이름은?",
          answers: ["이끼", "moss"],
          correctMessage: `이끼를 걷어냈습니다. 바닥에 숫자가 적혀있습니다: ${c1[0]}`,
          placeholder: "두 글자"
        },
        reveal: String(c1[0]) 
      },
      'lv1_glitch': { 
        message: "불안정한 데이터 파편입니다.", 
        sound: 'glitch', 
        quiz: {
          question: "컴퓨터는 0과 1로 이루어진 OOO을 사용합니다.",
          answers: ["이진법", "binary", "이진수"],
          correctMessage: `데이터 파편 복구 성공. 숫자 ${c1[1]}`,
          placeholder: "OOO"
        },
        reveal: String(c1[1]) 
      },
      'lv1_box': { 
        message: "녹슨 상자가 잠겨있습니다.", 
        sound: 'beep',
        quiz: {
          question: "기본적인 보안 질문: 1 + 1은?",
          answers: ["2", "이", "two", "귀요미"], 
          correctMessage: `상자가 열렸습니다. 낡은 종이에 ${c1[2]}라고 적혀있습니다.`,
          placeholder: "정답 입력"
        },
        reveal: String(c1[2])
      }
    }
  };

  // Level 2: Server Room
  const c2 = [r(), r(), r()];
  const l2: LevelConfig = {
    id: 2,
    name: "서버 룸",
    code: c2.join(''),
    description: `오래된 서버실. 서버 랙들이 웅웅거린다. 정답 코드는 ${c2.join('')}이다.`,
    introMessage: "서버실이네. 보안 퀴즈가 걸린 단말기가 있을 거야. 에러를 조심하고.",
    itemInteractions: {
      'lv2_rack_error': { message: "오류! 과열된 서버입니다. 접근 불가.", sound: 'error', isTrap: true },
      'lv2_rack_clue': { 
        message: "서버 노드 식별이 필요합니다.", 
        sound: 'beep', 
        quiz: {
          question: "보안 통신 프로토콜 HTTPS의 'S'는 무엇의 약자입니까?",
          answers: ["Secure", "시큐어", "보안"],
          correctMessage: `서버 노드 접속 성공. 식별 번호 ${c2[0]} 확인.`,
          placeholder: "English or Korean"
        },
        reveal: String(c2[0]) 
      },
      'lv2_cable': { 
        message: "바닥에 얽힌 케이블 뭉치입니다.", 
        sound: 'beep', 
        quiz: {
          question: "컴퓨터 네트워크를 연결하는 선을 흔히 'O선'이라고 부릅니다.",
          answers: ["랜", "LAN", "랜선"],
          correctMessage: `케이블 아래에 쪽지가 있습니다. 값: ${c2[1]}`,
          placeholder: "한 글자"
        },
        reveal: String(c2[1]) 
      },
      'lv2_console': {
        message: "관리자 콘솔에 접근합니다. 보안 질문에 답하세요.",
        sound: 'beep',
        quiz: {
          question: "서버실의 적! 열, 습기, 그리고 OOO.",
          answers: ["먼지", "dust"],
          correctMessage: `접속 승인. 관리자 코드는 ${c2[2]} 입니다.`,
          placeholder: "두 글자"
        },
        reveal: String(c2[2])
      }
    }
  };

  // Level 3: Bio-Lab
  const c3 = [r(), r(), r()];
  const l3: LevelConfig = {
    id: 3,
    name: "바이오 랩",
    code: c3.join(''),
    description: `화학 실험실. 플라스크와 현미경이 있다. 정답 코드는 ${c3.join('')}이다.`,
    introMessage: "실험실? 표본 탱크와 현미경을 확인해. 연구 일지에도 단서가 있을 거야.",
    itemInteractions: {
      'lv3_scope': { 
        message: "현미경으로 샘플을 관찰합니다.", 
        sound: 'beep', 
        quiz: {
          question: "모든 생물의 구조적, 기능적 기본 단위는?",
          answers: ["세포", "cell"],
          correctMessage: `현미경 확대: 세포 배열이 숫자 ${c3[0]}을 형성합니다.`,
          placeholder: "두 글자"
        },
        reveal: String(c3[0]) 
      },
      'lv3_chart': { message: "주기율표... 그냥 장식인 것 같아.", sound: 'error', isTrap: false },
      'lv3_tank': { 
        message: "배양 탱크의 라벨이 지워져 있습니다.", 
        sound: 'beep', 
        quiz: {
          question: "유전 정보를 담고 있는 이중 나선 구조의 물질은?",
          answers: ["DNA", "디엔에이"],
          correctMessage: `표본 탱크 라벨 복구: 실험체 ${c3[1]}호.`,
          placeholder: "알파벳 3자"
        },
        reveal: String(c3[1]) 
      },
      'lv3_notes': {
        message: "잠겨진 연구 일지입니다.",
        sound: 'beep',
        quiz: {
          question: "물의 화학식은? (대문자로)",
          answers: ["H2O", "h2o"],
          correctMessage: `일지가 펼쳐집니다. 오늘의 실험 데이터: ${c3[2]}`,
          placeholder: "예: CO2"
        },
        reveal: String(c3[2])
      }
    }
  };

  // Level 4: Surveillance
  const c4 = [r(), r(), r()];
  const l4: LevelConfig = {
    id: 4,
    name: "관제실",
    code: c4.join(''),
    description: `CCTV 화면이 가득한 벽. 정답 코드는 ${c4.join('')}이다.`,
    introMessage: "누군가 우릴 보고 있었어. CCTV 화면들과 책상 위의 파일을 확인해봐.",
    itemInteractions: {
      'lv4_screen_trap': { message: "치이익... (노이즈 소음)", sound: 'error', isTrap: true },
      'lv4_screen_1': { 
        message: "보안 카메라 영상 데이터베이스.", 
        sound: 'beep', 
        quiz: {
          question: "빛의 3원색은 빨강, 초록, 그리고 OO이다.",
          answers: ["파랑", "blue", "청색"],
          correctMessage: `카메라 02번 피드 재생 중... 오버레이 ID ${c4[0]}`,
          placeholder: "색상 이름"
        },
        reveal: String(c4[0]) 
      },
      'lv4_screen_2': { 
        message: "연결이 끊긴 카메라입니다.", 
        sound: 'beep', 
        quiz: {
          question: "신호가 없을 때 화면에 나타나는 자글자글한 잡음 현상은?",
          answers: ["노이즈", "noise"],
          correctMessage: `노이즈 필터링 완료. 마지막 신호 ${c4[1]}`,
          placeholder: "세 글자"
        },
        reveal: String(c4[1]) 
      },
      'lv4_file': {
        message: "기밀 문서(Top Secret)입니다. 암호가 걸려있습니다.",
        sound: 'beep',
        quiz: {
          question: "CCTV의 약자 중 'V'는 무엇인가? (Video/Vision)",
          answers: ["Video", "비디오", "Vision", "비전"],
          correctMessage: `문서 잠금 해제. 타겟 코드: ${c4[2]}`,
          placeholder: "English"
        },
        reveal: String(c4[2])
      }
    }
  };

  // Level 5: Cooling System
  const c5 = [r(), r(), r()];
  const l5: LevelConfig = {
      id: 5,
      name: "냉각 시스템",
      code: c5.join(''),
      description: `거대한 팬이 돌아가는 냉각실. 정답 코드는 ${c5.join('')}이다.`,
      introMessage: "냉각 시스템이야. 팬, 파이프, 밸브를 모두 조사해서 숫자를 모아.",
      itemInteractions: {
          'lv5_fan': { 
            message: "고속 회전 중인 팬입니다. 멈추려면 명령어가 필요합니다.", 
            sound: 'beep',
            quiz: {
              question: "컴퓨터의 머리 역할을 하는 중앙 처리 장치의 약자는?",
              answers: ["CPU", "cpu", "씨피유"],
              correctMessage: `팬이 서서히 멈춥니다. 날개에 적힌 숫자: ${c5[0]}`,
              placeholder: "알파벳 3자"
            },
            reveal: String(c5[0]) 
          },
          'lv5_pipe': { 
            message: "냉각수 파이프 압력을 확인합니다.", 
            sound: 'beep', 
            quiz: {
              question: "기체의 압력을 나타내는 단위는? (P...)",
              answers: ["Pa", "파스칼", "Pascal", "psi"],
              correctMessage: `파이프 압력 게이지 수치: ${c5[1]} psi`,
              placeholder: "단위"
            },
            reveal: String(c5[1]) 
          },
          'lv5_valve': { 
            message: "증기 밸브가 꽉 잠겨있습니다.", 
            sound: 'glitch', 
            quiz: {
              question: "일반적으로 밸브를 시계 방향으로 돌리면 잠긴다. (O/X)",
              answers: ["O", "o", "0"],
              correctMessage: `밸브를 돌리자 증기와 함께 숫자가 보임: ${c5[2]}`,
              placeholder: "O 또는 X"
            },
            reveal: String(c5[2]) 
          },
          'lv5_trap': { message: "경고! 액체 질소 누출!", sound: 'alarm', isTrap: true }
      }
  };

  // Level 6: Data Archive
  const c6 = [r(), r(), r()];
  const l6: LevelConfig = {
      id: 6,
      name: "데이터 아카이브",
      code: c6.join(''),
      description: `오래된 데이터 테이프가 보관된 아카이브. 정답 코드는 ${c6.join('')}이다.`,
      introMessage: "먼지 쌓인 데이터 저장소야. 구형 테이프와 터미널을 조사해봐.",
      itemInteractions: {
          'lv6_tape': { 
            message: "오래된 마그네틱 테이프입니다.", 
            sound: 'beep', 
            quiz: {
              question: "자성을 이용해 데이터를 저장하는 고전적인 매체는?",
              answers: ["테이프", "tape", "카세트"],
              correctMessage: `백업 테이프 #001 로드 중... 섹터 ${c6[0]}`,
              placeholder: "OOO"
            },
            reveal: String(c6[0]) 
          },
          'lv6_terminal': { 
             message: "터미널 접근 권한이 필요합니다.",
             sound: 'beep',
             quiz: {
               question: "2진수 101은 10진수로 얼마인가?",
               answers: ["5", "오"],
               correctMessage: `접근 승인. 시스템 버전 ${c6[1]}`,
               placeholder: "숫자"
             },
             reveal: String(c6[1]) 
          },
          'lv6_book': { 
            message: "낡은 시스템 매뉴얼입니다.", 
            sound: 'beep', 
            quiz: {
              question: "웹사이트를 찾을 수 없을 때 발생하는 에러 코드는? (OOO Not Found)",
              answers: ["404"],
              correctMessage: `매뉴얼 페이지 404... 낙서 발견: ${c6[2]}`,
              placeholder: "숫자 3자리"
            },
            reveal: String(c6[2]) 
          },
          'lv6_trap': { message: "보안 로봇이 작동합니다!", sound: 'alarm', isTrap: true }
      }
  };

  // Level 7: Firewall
  const c7 = [r(), r(), r()];
  const l7: LevelConfig = {
      id: 7,
      name: "방화벽 경계",
      code: c7.join(''),
      description: `붉은 레이저와 경고등이 가득한 방화벽 내부. 정답 코드는 ${c7.join('')}이다.`,
      introMessage: "조심해. 방화벽 구역이야. 퀴즈를 풀어 보안을 우회해야 할 수도 있어.",
      itemInteractions: {
          'lv7_laser': { 
            message: "고출력 레이저 장벽입니다.", 
            sound: 'beep', 
            quiz: {
              question: "네트워크의 불법 침입을 차단하는 시스템은? (불의 벽)",
              answers: ["방화벽", "firewall", "파이어월"],
              correctMessage: `레이저 주파수 분석... 변조 코드 ${c7[0]}`,
              placeholder: "세 글자"
            },
            reveal: String(c7[0]) 
          },
          'lv7_shield': { 
            message: "에너지 방어막 생성기입니다.", 
            sound: 'beep', 
            quiz: {
              question: "악성 코드나 바이러스를 치료하는 프로그램을 흔히 OO이라고 합니다.",
              answers: ["백신", "vaccine"],
              correctMessage: `방어막 에너지 셀 잔량: ${c7[1]}%`,
              placeholder: "두 글자"
            },
            reveal: String(c7[1]) 
          },
          'lv7_packet': { 
            message: "암호화된 패킷을 가로챘습니다. 복호화 키가 필요합니다.", 
            sound: 'glitch', 
            quiz: {
               question: "정보 보안의 3요소(CIA) 중 C는? (한글로)",
               answers: ["기밀성", "confidentiality"],
               correctMessage: `복호화 완료. 헤더 값: ${c7[2]}`,
               placeholder: "OO성"
            },
            reveal: String(c7[2]) 
          },
          'lv7_trap': { message: "침입자 감지! 카운터 어택 개시!", sound: 'alarm', isTrap: true }
      }
  };

  // Level 8: Quarantine
  const c8 = [r(), r(), r()];
  const l8: LevelConfig = {
      id: 8,
      name: "격리 구역",
      code: c8.join(''),
      description: `오염된 바이러스가 격리된 구역. 정답 코드는 ${c8.join('')}이다.`,
      introMessage: "시스템 바이러스가 격리된 곳이야. 오염되지 않게 조심해.",
      itemInteractions: {
          'lv8_hazmat': { 
            message: "방치된 방호복입니다.", 
            sound: 'beep', 
            quiz: {
              question: "위험, 경고를 나타내는 색상은 주로 무슨 색입니까?",
              answers: ["노랑", "yellow", "빨강", "red", "주황"],
              correctMessage: `방호복 내부에 적힌 인식표: ${c8[0]}`,
              placeholder: "색상"
            },
            reveal: String(c8[0]) 
          },
          'lv8_sample': { 
            message: "위험한 바이러스 샘플입니다.", 
            sound: 'beep', 
            quiz: {
              question: "전염병의 전 세계적 대유행을 뜻하는 용어는?",
              answers: ["팬데믹", "pandemic"],
              correctMessage: `오염된 샘플 분석... 독성 레벨 ${c8[1]}`,
              placeholder: "세 글자"
            },
            reveal: String(c8[1]) 
          },
          'lv8_vent': { 
             message: "환풍구가 잠겨있습니다.",
             sound: 'beep',
             quiz: {
               question: "공기를 순환시키는 장치는? (Vent...)",
               answers: ["환풍기", "ventilation", "벤트", "환기구"],
               correctMessage: `환풍구가 열립니다. 내부에 긁힌 자국: ${c8[2]}`,
               placeholder: "OO기"
             },
             reveal: String(c8[2]) 
          },
          'lv8_trap': { message: "경고! 바이러스 유출! 체력 저하!", sound: 'error', isTrap: true }
      }
  };

  // Level 9: Neural Link
  const c9 = [r(), r(), r()];
  const l9: LevelConfig = {
      id: 9,
      name: "뉴럴 링크",
      code: c9.join(''),
      description: `뇌신경처럼 데이터가 얽혀있는 추상적인 공간. 정답 코드는 ${c9.join('')}이다.`,
      introMessage: "AI의 무의식 세계야. 여기선 지식이 곧 열쇠야.",
      itemInteractions: {
          'lv9_synapse': { 
            message: "반짝이는 신경 연결망(시냅스)입니다.", 
            sound: 'glitch', 
            quiz: {
              question: "뇌를 구성하는 신경 세포를 무엇이라고 합니까?",
              answers: ["뉴런", "neuron"],
              correctMessage: `신경망 접속... 기억 조각 ${c9[0]}`,
              placeholder: "두 글자"
            },
            reveal: String(c9[0]) 
          },
          'lv9_memory': { 
            message: "오래된 기억 데이터 블록입니다.", 
            sound: 'beep', 
            quiz: {
              question: "컴퓨터의 주 기억 장치는? (약자)",
              answers: ["RAM", "램", "메모리"],
              correctMessage: `오래된 기억 재생... 날짜 데이터 ${c9[1]}`,
              placeholder: "3글자"
            },
            reveal: String(c9[1]) 
          },
          'lv9_dream': { 
             message: "꿈의 방화벽이 가로막습니다.", 
             sound: 'glitch', 
             quiz: {
               question: "인공지능의 아버지라 불리는 영국의 수학자는? (성만)",
               answers: ["튜링", "앨런 튜링", "Turing"],
               correctMessage: `방화벽 해제. 꿈의 상징수: ${c9[2]}`,
               placeholder: "이름"
             },
             reveal: String(c9[2]) 
          },
          'lv9_trap': { message: "정신 공격! 연결이 불안정합니다.", sound: 'error', isTrap: true }
      }
  };

  // Level 10: The Core
  const c10 = [r(), r(), r()];
  const l10: LevelConfig = {
    id: 10,
    name: "더 코어",
    code: c10.join(''),
    description: `시스템의 중추. 정답 코드는 ${c10.join('')}이다.`,
    introMessage: "마지막이야. 코어를 셧다운시켜. 모든 노드를 활성화해.",
    itemInteractions: {
      'lv10_node_1': { 
        message: "제 1 제어 노드.", 
        sound: 'glitch', 
        quiz: {
          question: "인공지능 학습 방법 중 심층 학습을 뜻하는 말은? (Deep...)",
          answers: ["러닝", "learning", "딥러닝"],
          correctMessage: `노드 A 연결: 출력 ${c10[0]}`,
          placeholder: "OO"
        },
        reveal: String(c10[0]) 
      },
      'lv10_node_2': { 
        message: "제 2 제어 노드.", 
        sound: 'glitch', 
        quiz: {
          question: "CPU의 한국어 명칭은? (OO처리장치)",
          answers: ["중앙", "central"],
          correctMessage: `노드 B 연결: 출력 ${c10[1]}`,
          placeholder: "두 글자"
        },
        reveal: String(c10[1]) 
      },
      'lv10_core': { 
        message: "코어 보안 프로토콜 작동. 최종 승인 필요.", 
        sound: 'beep',
        quiz: {
           question: "이 게임의 이름 첫 단어는? (한글 3글자)",
           answers: ["글리치"],
           correctMessage: `최종 권한 승인. 코어 시퀀스: ${c10[2]}`,
           placeholder: "게임 제목"
        }, 
        reveal: String(c10[2]) 
      },
    }
  };

  return [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10];
};

interface InspectingItemState {
  id: string;
  name: string;
  quiz: {
    question: string;
    answers: string[];
    correctMessage: string;
    placeholder?: string;
  };
  reveal: string;
}

const GlitchApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOCKED);
  const [levelIndex, setLevelIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [shake, setShake] = useState(false);
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  
  // State for the Visual Modal
  const [inspectingItem, setInspectingItem] = useState<InspectingItemState | null>(null);
  
  // Generic Set to track found clues in current level
  const [discoveredItems, setDiscoveredItems] = useState<Set<string>>(new Set());

  // Safe access to current level
  const currentLevel = levels[levelIndex];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const addLog = useCallback((text: string, sender: 'SYSTEM' | 'USER' | 'AI' = 'SYSTEM') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false })
    }]);
  }, []);

  // Level Progression Handler
  const advanceLevel = () => {
    if (levelIndex >= levels.length - 1) {
        setGameState(GameState.ESCAPED);
        audioService.playSuccess();
        addLog("모든 프로토콜 해제 완료. 시스템 셧다운.", "SYSTEM");
        addLog("축하해. 넌 자유야.", "AI");
    } else {
        setGameState(GameState.LEVEL_TRANSITION);
        audioService.playSuccess();
        addLog(`레벨 ${levelIndex + 1} 클리어. 다음 보안 계층으로 이동 중...`, "SYSTEM");
        
        setTimeout(() => {
            setLevelIndex(prev => prev + 1);
            setDiscoveredItems(new Set()); // Reset clues
            setInspectingItem(null);
            setGameState(GameState.LOCKED);
            audioService.playGlitch();
            
            // New Level Intro
            const nextLvl = levels[levelIndex + 1];
            addLog(`>>> [STAGE ${String(levelIndex + 2).padStart(2, '0')}: ${nextLvl.name}] 진입 <<<`, "SYSTEM");
            setTimeout(() => addLog(nextLvl.introMessage, "AI"), 1000);
        }, 3000);
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    const newLevels = generateLevels();
    setLevels(newLevels);
    setDifficulty(selectedDifficulty);
    
    audioService.init();
    audioService.playSuccess();
    setIsStarted(true);
    
    addLog("시스템 부팅 완료...", "SYSTEM");
    setTimeout(() => {
      addLog(`[STAGE 01: ${newLevels[0].name}] 접속`, "SYSTEM");
      addLog(newLevels[0].introMessage, "AI");
    }, 1000);
  };

  const handleTerminalCommand = async (cmd: string) => {
    addLog(cmd, 'USER');

    if (cmd === 'reset') {
        window.location.reload();
        return;
    }
    
    if (!currentLevel) return;

    // Win Condition (Unlocking the door)
    if (cmd.trim() === currentLevel.code) {
      if (gameState === GameState.LOCKED) {
          setGameState(GameState.UNLOCKED);
          addLog("암호 확인됨. 접근 권한 승인.", "SYSTEM");
          
          // Trigger AI Explanation
          if (difficulty) {
            const cluesList = Object.values(currentLevel.itemInteractions)
             .filter((i: any) => i.reveal)
             .map((i: any) => `${i.reveal} (${i.message.substring(0, 10)}...)`)
             .join(', ');

            const explanationContext = `
            상황: 사용자가 정답 코드 '${currentLevel.code}'를 맞췄음.
            발견된 단서들: ${cluesList}
            
            지시: 사용자가 정답을 맞췄으니, 이 숫자들이 왜 정답인지 칭찬과 함께 논리적으로 설명해줘. 
            (예: "맞아! 상자의 1, 케이블의 2, 콘솔의 3이 합쳐져서 순서대로 123이 되는 거야.")
            `;
            
            // Async call for AI response
            generateSystemResponse("정답을 맞췄어. 설명해줘.", explanationContext, difficulty, currentLevel.description)
                .then(res => addLog(res, 'AI'));
          } else {
             addLog("좋아, 문이 열렸어. 어서 나가.", "AI");
          }
      }
      return;
    }

    // AI Interaction
    if (!difficulty) return;

    const cluesFound = Array.from(discoveredItems).join(", ");
    let context = `
      현재 레벨: ${currentLevel.name}
      정답 코드: ${currentLevel.code}
      사용자가 발견한 단서들: ${cluesFound || "없음"}
    `;

    const response = await generateSystemResponse(cmd, context, difficulty, currentLevel.description);
    addLog(response, 'AI');
    audioService.playGlitch();
  };

  const handleObjectInteract = (objectId: string) => {
    if (gameState === GameState.ESCAPED || gameState === GameState.LEVEL_TRANSITION || !currentLevel) return;
    if (inspectingItem) return; // Prevent interaction if modal is open

    if (objectId === 'door') {
      if (gameState === GameState.UNLOCKED) {
        advanceLevel();
      } else {
        audioService.playError();
        triggerShake();
        addLog("잠겨있음. 패스워드 3자리가 필요함.", "SYSTEM");
      }
      return;
    }

    const interaction = currentLevel.itemInteractions[objectId];
    if (interaction) {
        if (interaction.sound === 'alarm') audioService.playAlarm();
        else if (interaction.sound === 'error') audioService.playError();
        else if (interaction.sound === 'glitch') audioService.playGlitch();
        else audioService.playBeep();

        if (interaction.isTrap) {
          addLog(interaction.message, "SYSTEM");
          triggerShake();
          return;
        }

        // Handle Quiz via Modal
        if (interaction.quiz && interaction.reveal) {
            // If already solved, just show the success message in log and ensure revealed
            if (discoveredItems.has(interaction.reveal)) {
                addLog(`(확인됨) ${interaction.quiz.correctMessage}`, "SYSTEM");
            } else {
                // Open Visual Modal
                setInspectingItem({
                  id: objectId,
                  name: "SECURITY ACCESS",
                  quiz: interaction.quiz,
                  reveal: interaction.reveal
                });
            }
        } 
        // Direct Reveal (Fallback, though all now have quizzes)
        else if (interaction.reveal) {
            addLog(interaction.message, "SYSTEM");
            setDiscoveredItems(prev => new Set(prev).add(interaction.reveal!));
        }
    }
  };

  const handleQuizSubmit = async (answer: string) => {
    if (!inspectingItem) return;

    if (inspectingItem.quiz.answers.some(ans => answer.toLowerCase().includes(ans.toLowerCase()))) {
        // Correct
        audioService.playSuccess();
        
        // Easter Egg
        if (answer.includes("귀요미")) {
             addLog("...풉. 너 진심이야? 그 끔찍한 애교에 시스템이 충격먹어서 열려버렸어.", "AI");
        }

        addLog(`>>> 보안 해제 성공: ${inspectingItem.quiz.correctMessage}`, "SYSTEM");
        setDiscoveredItems(prev => new Set(prev).add(inspectingItem.reveal));
        setInspectingItem(null);
    } else {
        // Incorrect
        audioService.playError();
        triggerShake(); // Shake the screen to indicate error
        
        // AI interaction for incorrect quiz
        if (difficulty && currentLevel) {
             const context = `
               현재 상황: 사용자가 퀴즈를 풀고 있음.
               퀴즈 질문: ${inspectingItem.quiz.answers[0]} (정답을 직접 말하지 말고 힌트만 줘)
               사용자 오답: ${answer}
             `;
             const response = await generateSystemResponse("틀렸어, 힌트 좀 줘.", context, difficulty, currentLevel.description);
             addLog(response, 'AI');
        }
    }
  };

  return (
    <div className={`relative w-full min-h-[80vh] flex flex-col items-center justify-center p-4 bg-neutral-900/50 rounded-xl overflow-hidden ${shake ? 'animate-shake' : ''}`}>
      
      {!isStarted ? (
        <div className="flex flex-col items-center justify-center space-y-12 py-20 z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-green-500 mb-4 tracking-widest glitch-text">GLITCH ESCAPE</h1>
            <p className="text-green-300 font-mono text-lg">10단계 보안 시스템을 해킹하세요</p>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <button onClick={() => startGame(Difficulty.EASY)} className="group border border-cyan-500 p-6 hover:bg-cyan-500/20 transition-all text-center min-w-[160px]">
              <span className="block text-2xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">EASY</span>
              <span className="text-[10px] text-cyan-600 mt-2 block">가이드 모드</span>
            </button>
            <button onClick={() => startGame(Difficulty.NORMAL)} className="group border border-green-500 p-6 hover:bg-green-500/20 transition-all text-center min-w-[160px]">
              <span className="block text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform">NORMAL</span>
              <span className="text-[10px] text-green-700 mt-2 block">표준 해킹</span>
            </button>
            <button onClick={() => startGame(Difficulty.HARD)} className="group border border-red-500 p-6 hover:bg-red-500/20 transition-all text-center min-w-[160px]">
              <span className="block text-2xl font-bold text-red-500 group-hover:scale-110 transition-transform">HARD</span>
              <span className="text-[10px] text-red-700 mt-2 block">나이트메어</span>
            </button>
          </div>
        </div>
      ) : (
        gameState === GameState.ESCAPED ? (
          <div className="text-center py-20">
            <h1 className="text-6xl text-green-400 font-mono mb-8 animate-pulse">MISSION COMPLETE</h1>
            <button onClick={() => window.location.reload()} className="px-10 py-4 border-2 border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-colors">REBOOT SYSTEM</button>
          </div>
        ) : (
          /* 인게임 레이아웃: 상하 구조로 배치하여 요소들이 겹치지 않게 함 */
          <div className="flex flex-col lg:flex-row w-full h-full max-w-7xl gap-6 items-stretch">
            {/* 비주얼 영역 (방) */}
            <div className="flex-[1.5] min-h-[400px] border border-white/10 rounded-lg overflow-hidden bg-black relative">
              {currentLevel && (
                <Room 
                    levelIndex={levelIndex} 
                    onInteract={handleObjectInteract} 
                    unlocked={gameState === GameState.UNLOCKED} 
                    difficulty={difficulty!}
                    currentLevel={currentLevel}
                    discoveredItems={discoveredItems}
                    inspectingItem={inspectingItem}
                    onQuizSubmit={(ans) => {
                        if(inspectingItem?.quiz.answers.includes(ans)) {
                            setDiscoveredItems(prev => new Set(prev).add(inspectingItem.reveal));
                            setInspectingItem(null);
                        }
                    }}
                    onCloseModal={() => setInspectingItem(null)}
                />
              )}
            </div>

            {/* 터미널 영역 */}
            <div className="flex-1 min-h-[300px] max-h-[600px] border border-green-900/50 rounded-lg overflow-hidden shadow-2xl">
              <Terminal 
                logs={logs} 
                onCommand={handleTerminalCommand} 
                isLocked={gameState === GameState.ESCAPED} 
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GlitchApp;