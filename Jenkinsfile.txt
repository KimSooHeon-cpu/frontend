pipeline {

    // https://www.jenkins.io/doc/book/pipeline/syntax/#agent 
   agent any   
   
   stages {
   
       // 
        stage('Stage-1 : Checkout Jenkins for React Github(repo)') {
        
            // build-step : https://www.jenkins.io/doc/pipeline/steps/pipeline-build-step/
            // 참고) SCM : Software Configuration Management(소프트웨어 형상 관리)의 약자
            // Ant, Maven, Gradle 같은 빌드툴이나 Jenkins, Github Action 등의 CI/CD툴도 프로젝트 형상관리툴로 간주함. 
            steps {
                // 참고) jenkins가 기본적으로 체크아웃을 하지만 파이프라인(pipeline)에서 아래와 같이 기입하는 이유는                
                // checkout 전에 local reference repo를 업데이트 하고자 할때는 기본적인 jenkins의 checkout을 건너뛰고
                // 나중에 아래와 같이 checkout scm 해야 한다.
                // 만약 파이프라인에 여러개의 플랫폼 노드가 존재할 경우는 reference repo에 같은 경로를 사용할 수 없으며, 
                // Windows Stage는 Linux 파이프파인에서 위치를 재정의해야 된다.
                // github 저장소 사용시 내부적으로 "checkout scm"이 수행되어야"만" git 커밋이 처리된 것으로 간주한다.
                
                // 참고 링크) https://www.reddit.com/r/jenkinsci/comments/piz3ar/is_checkout_scm_usefull_in_pipeline_if_jenkins/?tl=ko
                checkout scm
            }
            
        }        
        
        // https://www.jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm/
        // npm 명령어
        // : https://docs.npmjs.com/cli/v11/commands 
        // : https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=mgveg&logNo=221872307170
        

      // 참고 : npm install & npm ci 차이점
      // https://mygumi.tistory.com/409
        stage('Stage-2 : React NPM Build in Jenkins') {
      
         steps {                     
         
            // 최초에는 docker exec -it jenkins bash로 내부 접속하여 프로젝트 폴더 작성할 것 (mkdir)
            
            sh 'npm cache clean --force' // cache 삭제
            // sh 'npm ci' // ci&cd pipeline
            sh 'npm install'

            // 패키지 설치시 에러 메시징 및 호환성 패치를 위한 조치
            sh 'npm fund'
            sh 'npm audit fix'
            
            // jenkins 프로젝트 폴더로 이동                          
            sh 'cd /var/jenkins_home/workspace/frontend'      

            sh 'rm -rf dist' // 기존 빌드 파일들 삭제      
            sh 'npm run build' // npm 빌드 (react)            
            
            sh 'pwd' // 폴더 위치 확인   
         }
         
         post {
            success {
                   echo 'NPM Build & Copy Successfully'
                }
                failure{
                   error 'NPM Build & Copy Failed'
               }
            }
      }   

   }
   
}