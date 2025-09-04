pipeline {
    agent any
    environment {
        REGISTRY         = 'harbor.tsirylab.com'
        HARBOR_PROJECT   = 'pnud-agvm'
        IMAGE_NAME       = 'serviceModernMarket'
        IMAGE_TAG        = "${BUILD_NUMBER}"
        FULL_IMAGE_NAME  = "${REGISTRY}/${HARBOR_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}"
        NAMESPACE        = 'pnud-agvm'
        K8S_DIR          = 'k8s'
        DEPLOYMENT_NAME  = 'serviceModernMarket'
        SERVICE_NAME     = 'serviceModernMarket-service'
        HPA_NAME         = 'serviceModernMarket-hpa'
        SECRET_NAME      = 'serviceModernMarket-secret'
        PORT             = '5033'
        NODE_PORT        = '30133'
    }

    stages {
        stage('Build & Push') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'harbor-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS'),
                    string(credentialsId: 'POSTGRES_HOST_ID', variable: 'POSTGRES_HOST'),
                    string(credentialsId: 'POSTGRES_PORT_ID', variable: 'POSTGRES_PORT'),
                    string(credentialsId: 'POSTGRES_USER_ID', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD_ID', variable: 'POSTGRES_PASSWORD'),
                ]) {
                    sh '''
                        set -e
                        docker logout $REGISTRY || true
                        docker build \
                          --build-arg PORT=5033 \
                          -t $FULL_IMAGE_NAME .
                        echo $HARBOR_PASS | \
                          docker login -u $HARBOR_USER --password-stdin $REGISTRY
                        docker push $FULL_IMAGE_NAME
                        docker logout $REGISTRY
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig-jenkins', variable: 'KUBECONFIG'),
                    usernamePassword(credentialsId: 'harbor-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS'),
                    string(credentialsId: 'POSTGRES_HOST_ID', variable: 'POSTGRES_HOST'),
                    string(credentialsId: 'POSTGRES_PORT_ID', variable: 'POSTGRES_PORT'),
                    string(credentialsId: 'POSTGRES_USER_ID', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'POSTGRES_PASSWORD_ID', variable: 'POSTGRES_PASSWORD'),
                ]) {
                    sh '''
                        set -e
                        export KUBECONFIG=$KUBECONFIG

                        kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
                        kubectl delete secret harbor-registry-secret -n $NAMESPACE --ignore-not-found
                        kubectl create secret docker-registry harbor-registry-secret \
                          --docker-server=$REGISTRY \
                          --docker-username="$HARBOR_USER" \
                          --docker-password="$HARBOR_PASS" \
                          --namespace=$NAMESPACE

                        kubectl delete secret $SECRET_NAME -n $NAMESPACE --ignore-not-found
                        kubectl create secret generic $SECRET_NAME \
                          --from-literal=POSTGRES_HOST="${POSTGRES_HOST}" \
                          --from-literal=POSTGRES_PORT="${POSTGRES_PORT}" \
                          --from-literal=POSTGRES_USER="${POSTGRES_USER}" \
                          --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
                          --from-literal=POSTGRES_DATABASE="serviceModernMarket" \
                          --namespace=$NAMESPACE

                        for res in deployment service hpa; do
                            envsubst < $K8S_DIR/serviceModernMarket-$res.yaml > /tmp/serviceModernMarket-$res.yaml
                            kubectl apply -f /tmp/serviceModernMarket-$res.yaml
                        done

                        kubectl rollout status deployment/serviceModernMarket -n $NAMESPACE --timeout=120s
                        kubectl get pods -n $NAMESPACE -l app=serviceModernMarket
                    '''
                }
            }
        }
    }

    post { always { cleanWs() } }
}
