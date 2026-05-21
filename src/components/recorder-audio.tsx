import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';

import { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function RecorderAudioComponent() {
    const audioRecorder = useAudioRecorder(
        RecordingPresets.HIGH_QUALITY
    );

    const recorderState = useAudioRecorderState(audioRecorder);

    const [recordingUri, setRecordingUri] = useState<string | null>(null);

    const player = useAudioPlayer(
        recordingUri ? { uri: recordingUri } : null
    );

    useEffect(() => {
        (async () => {
            const status =
                await AudioModule.requestRecordingPermissionsAsync();

            if (!status.granted) {
                alert('Permission to access microphone was denied');
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    const record = async () => {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
    };

    const stopRecording = async () => {
        await audioRecorder.stop();

        if (audioRecorder.uri) {
            setRecordingUri(audioRecorder.uri);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title={
                    recorderState.isRecording
                        ? 'Stop Recording'
                        : 'Start Recording'
                }
                onPress={
                    recorderState.isRecording
                        ? stopRecording
                        : record
                }
            />

            <Button
                title="Play Sound"
                disabled={!recordingUri}
                onPress={() => player.play()}
            />

            <Button
                title="Replay Sound"
                disabled={!recordingUri}
                onPress={() => {
                    player.seekTo(0);
                    player.play();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
    },
});