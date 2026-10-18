from rest_framework import serializers


class RunCodeSerializer(serializers.Serializer):
    code = serializers.CharField(allow_blank=False, trim_whitespace=False)
    stdin = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        trim_whitespace=False,
    )
    language = serializers.ChoiceField(
        choices=["python"],
        default="python",
        required=False,
    )


class RunResultSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    stdout = serializers.CharField(allow_blank=True)
    stderr = serializers.CharField(allow_blank=True)
    timed_out = serializers.BooleanField()
    exit_code = serializers.IntegerField(allow_null=True)
    error = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    language = serializers.CharField()
    via = serializers.CharField(required=False)
